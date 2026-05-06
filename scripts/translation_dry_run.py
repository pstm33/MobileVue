import argparse
import csv
import html
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import paramiko

try:
    import language_tool_python
except Exception:  # pragma: no cover
    language_tool_python = None

try:
    from deep_translator import GoogleTranslator
except Exception:  # pragma: no cover
    GoogleTranslator = None


CYRILLIC_HINT = re.compile(r"[А-Яа-яЁё]")
LATIN_TO_CYRILLIC = str.maketrans(
    {
        "A": "А",
        "B": "В",
        "C": "С",
        "E": "Е",
        "H": "Н",
        "K": "К",
        "M": "М",
        "O": "О",
        "P": "Р",
        "T": "Т",
        "X": "Х",
        "Y": "У",
        "a": "а",
        "c": "с",
        "e": "е",
        "o": "о",
        "p": "р",
        "x": "х",
        "y": "у",
    }
)

MANUAL_REPLACEMENTS = {
    "Жаренный": "Жареный",
    "жаренный": "жареный",
    "грущей": "грушей",
    "Грущей": "Грушей",
    "груща": "груша",
    "Груща": "Груша",
    "дор блю": "Дор Блю",
    "C ": "С ",
}


@dataclass
class SshConfig:
    host: str
    port: int
    username: str
    password: str
    db_name: str
    db_user: str
    db_password: str


def fix_mixed_script(text: str) -> str:
    if not text or not CYRILLIC_HINT.search(text):
        return text
    return text.translate(LATIN_TO_CYRILLIC)


def normalize_ru(text: str) -> tuple[str, list[str]]:
    text = html.unescape(text or "").strip()
    notes: list[str] = []
    if not text:
        return "", notes

    fixed = fix_mixed_script(text)
    if fixed != text:
        notes.append("mixed-script")
        text = fixed

    for source, target in MANUAL_REPLACEMENTS.items():
        updated = text.replace(source, target)
        if updated != text:
            notes.append(f"manual:{source}->{target}")
            text = updated

    updated = re.sub(r"\s+", " ", text).strip(" ,")
    if updated != text:
        notes.append("whitespace")
        text = updated

    return text, notes


def maybe_language_tool(text: str, tool) -> tuple[str, list[str]]:
    if not tool or not text:
        return text, []
    try:
        matches = tool.check(text)
        corrected = language_tool_python.utils.correct(text, matches)
    except Exception:
        return text, []
    if corrected != text:
        return corrected, [m.message for m in matches[:3]]
    return text, []


def translate_text(translator, text: str) -> str:
    if not translator or not text:
        return ""
    try:
        result = translator.translate(text)
        return result or ""
    except Exception:
        return ""


def fetch_rows(ssh: SshConfig, query: str) -> list[dict[str, str]]:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        ssh.host,
        port=ssh.port,
        username=ssh.username,
        password=ssh.password,
        timeout=20,
    )
    mysql_cmd = (
        f"mysql -u{ssh.db_user} -p'{ssh.db_password}' "
        f"-D {ssh.db_name} --default-character-set=utf8mb4 --batch --raw -e "
        f"\"{query}\""
    )
    _, stdout, stderr = client.exec_command(mysql_cmd, timeout=120)
    out = stdout.read().decode("utf-8", errors="replace").splitlines()
    err = stderr.read().decode("utf-8", errors="replace")
    client.close()

    if err and "Warning" not in err:
        raise RuntimeError(err)
    if not out:
        return []

    headers = out[0].split("\t")
    rows: list[dict[str, str]] = []
    for line in out[1:]:
        cols = line.split("\t")
        row = {headers[i]: (cols[i] if i < len(cols) else "") for i in range(len(headers))}
        rows.append(row)
    return rows


def write_csv(path: Path, rows: list[dict[str, str]], headers: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def build_item_report(ssh: SshConfig, use_language_tool: bool, use_translate: bool) -> list[dict[str, str]]:
    query = """
    SELECT
      i.item_id,
      i.merchant_id,
      m.restaurant_name,
      i.item_name AS base_name,
      i.item_short_description AS base_short_description,
      IFNULL(MAX(CASE WHEN t.language='ru' THEN t.item_name END),'') AS ru_name,
      IFNULL(MAX(CASE WHEN t.language='tk' THEN t.item_name END),'') AS tk_name,
      IFNULL(MAX(CASE WHEN t.language='ru' THEN t.item_short_description END),'') AS ru_short_description,
      IFNULL(MAX(CASE WHEN t.language='tk' THEN t.item_short_description END),'') AS tk_short_description
    FROM st_item i
    LEFT JOIN st_merchant m ON m.merchant_id=i.merchant_id
    LEFT JOIN st_item_translation t ON t.item_id=i.item_id
    GROUP BY
      i.item_id, i.merchant_id, m.restaurant_name,
      i.item_name, i.item_short_description
    ORDER BY i.item_id
    """.strip()

    rows = fetch_rows(ssh, query)
    tool = language_tool_python.LanguageTool("ru-RU") if use_language_tool and language_tool_python else None
    en_translator = GoogleTranslator(source="ru", target="en") if use_translate and GoogleTranslator else None
    tk_translator = GoogleTranslator(source="ru", target="tk") if use_translate and GoogleTranslator else None

    report: list[dict[str, str]] = []
    for row in rows:
        final_name, notes = normalize_ru(row["base_name"])
        lt_name, lt_notes = maybe_language_tool(final_name, tool)
        if lt_name != final_name:
            notes.append("language-tool:name")
            final_name = lt_name
        final_desc, desc_notes = normalize_ru(row["base_short_description"])
        lt_desc, lt_desc_notes = maybe_language_tool(final_desc, tool)
        if lt_desc != final_desc:
            desc_notes.append("language-tool:short_description")
            final_desc = lt_desc

        report.append(
            {
                "item_id": row["item_id"],
                "merchant_id": row["merchant_id"],
                "restaurant_name": row["restaurant_name"],
                "base_name": row["base_name"],
                "proposed_ru_name": final_name,
                "existing_ru_name": row["ru_name"],
                "existing_tk_name": row["tk_name"],
                "proposed_en_name": translate_text(en_translator, final_name),
                "proposed_tk_name": translate_text(tk_translator, final_name),
                "name_notes": " | ".join(notes + lt_notes),
                "base_short_description": row["base_short_description"],
                "proposed_ru_short_description": final_desc,
                "existing_ru_short_description": row["ru_short_description"],
                "existing_tk_short_description": row["tk_short_description"],
                "proposed_en_short_description": translate_text(en_translator, final_desc),
                "proposed_tk_short_description": translate_text(tk_translator, final_desc),
                "short_description_notes": " | ".join(desc_notes + lt_desc_notes),
            }
        )
    return report


def build_category_report(ssh: SshConfig, use_language_tool: bool, use_translate: bool) -> list[dict[str, str]]:
    query = """
    SELECT
      c.cat_id,
      c.merchant_id,
      m.restaurant_name,
      c.category_name AS base_name,
      IFNULL(MAX(CASE WHEN t.language='ru' THEN t.category_name END),'') AS ru_name,
      IFNULL(MAX(CASE WHEN t.language='tk' THEN t.category_name END),'') AS tk_name
    FROM st_category c
    LEFT JOIN st_merchant m ON m.merchant_id=c.merchant_id
    LEFT JOIN st_category_translation t ON t.cat_id=c.cat_id
    GROUP BY c.cat_id, c.merchant_id, m.restaurant_name, c.category_name
    ORDER BY c.cat_id
    """.strip()

    rows = fetch_rows(ssh, query)
    tool = language_tool_python.LanguageTool("ru-RU") if use_language_tool and language_tool_python else None
    en_translator = GoogleTranslator(source="ru", target="en") if use_translate and GoogleTranslator else None
    tk_translator = GoogleTranslator(source="ru", target="tk") if use_translate and GoogleTranslator else None

    report: list[dict[str, str]] = []
    for row in rows:
        final_name, notes = normalize_ru(row["base_name"])
        lt_name, lt_notes = maybe_language_tool(final_name, tool)
        if lt_name != final_name:
            notes.append("language-tool:name")
            final_name = lt_name

        report.append(
            {
                "cat_id": row["cat_id"],
                "merchant_id": row["merchant_id"],
                "restaurant_name": row["restaurant_name"],
                "base_name": row["base_name"],
                "proposed_ru_name": final_name,
                "existing_ru_name": row["ru_name"],
                "existing_tk_name": row["tk_name"],
                "proposed_en_name": translate_text(en_translator, final_name),
                "proposed_tk_name": translate_text(tk_translator, final_name),
                "name_notes": " | ".join(notes + lt_notes),
            }
        )
    return report


def write_summary(path: Path, items: list[dict[str, str]], categories: list[dict[str, str]]) -> None:
    item_changed = sum(1 for row in items if row["base_name"] != row["proposed_ru_name"])
    item_desc_changed = sum(
        1
        for row in items
        if row["base_short_description"] != row["proposed_ru_short_description"]
    )
    category_changed = sum(1 for row in categories if row["base_name"] != row["proposed_ru_name"])

    lines = [
        "# Translation Dry Run",
        "",
        f"- Items: {len(items)}",
        f"- Categories: {len(categories)}",
        f"- Item names changed by Russian cleanup: {item_changed}",
        f"- Item short descriptions changed by Russian cleanup: {item_desc_changed}",
        f"- Category names changed by Russian cleanup: {category_changed}",
        "",
        "## Sample corrected item names",
    ]

    sample_items = [row for row in items if row["base_name"] != row["proposed_ru_name"]][:15]
    if not sample_items:
        sample_items = items[:15]
    for row in sample_items:
        lines.append(
            f"- [{row['restaurant_name']}] {row['base_name']} -> {row['proposed_ru_name']}"
        )

    lines.extend(["", "## Sample corrected categories"])
    sample_categories = [row for row in categories if row["base_name"] != row["proposed_ru_name"]][:15]
    if not sample_categories:
        sample_categories = categories[:15]
    for row in sample_categories:
        lines.append(
            f"- [{row['restaurant_name']}] {row['base_name']} -> {row['proposed_ru_name']}"
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--db-name", required=True)
    parser.add_argument("--db-user", required=True)
    parser.add_argument("--db-password", required=True)
    parser.add_argument("--out-dir", default="reports/translation_dry_run")
    parser.add_argument("--skip-language-tool", action="store_true")
    parser.add_argument("--skip-translate", action="store_true")
    args = parser.parse_args()

    ssh = SshConfig(
        host=args.host,
        port=args.port,
        username=args.user,
        password=args.password,
        db_name=args.db_name,
        db_user=args.db_user,
        db_password=args.db_password,
    )

    out_dir = Path(args.out_dir)
    items = build_item_report(
        ssh,
        use_language_tool=not args.skip_language_tool,
        use_translate=not args.skip_translate,
    )
    categories = build_category_report(
        ssh,
        use_language_tool=not args.skip_language_tool,
        use_translate=not args.skip_translate,
    )

    write_csv(
        out_dir / "items.csv",
        items,
        [
            "item_id",
            "merchant_id",
            "restaurant_name",
            "base_name",
            "proposed_ru_name",
            "existing_ru_name",
            "existing_tk_name",
            "proposed_en_name",
            "proposed_tk_name",
            "name_notes",
            "base_short_description",
            "proposed_ru_short_description",
            "existing_ru_short_description",
            "existing_tk_short_description",
            "proposed_en_short_description",
            "proposed_tk_short_description",
            "short_description_notes",
        ],
    )
    write_csv(
        out_dir / "categories.csv",
        categories,
        [
            "cat_id",
            "merchant_id",
            "restaurant_name",
            "base_name",
            "proposed_ru_name",
            "existing_ru_name",
            "existing_tk_name",
            "proposed_en_name",
            "proposed_tk_name",
            "name_notes",
        ],
    )
    write_summary(out_dir / "summary.md", items, categories)
    print(json.dumps({"items": len(items), "categories": len(categories), "out_dir": str(out_dir)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
