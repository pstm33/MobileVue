import argparse
import csv
import datetime as dt
import json
from pathlib import Path

import paramiko


def sql_escape(value: str) -> str:
    value = value or ""
    value = value.replace("\\", "\\\\").replace("'", "\\'")
    return value


def non_empty(value: str) -> bool:
    return bool((value or "").strip())


def build_sql(rows: list[dict[str, str]]) -> str:
    statements = ["START TRANSACTION;"]

    for row in rows:
        item_id = int(row["id"])

        name_en = (row.get("name_en") or "").strip()
        short_en = (row.get("short_description_en") or "").strip()
        desc_en = (row.get("description_en") or "").strip()

        name_ru = (row.get("name_ru") or "").strip()
        short_ru = (row.get("short_description_ru") or "").strip()
        desc_ru = (row.get("description_ru") or "").strip()

        name_tm = (row.get("name_tm") or "").strip()
        short_tm = (row.get("short_description_tm") or "").strip()
        desc_tm = (row.get("description_tm") or "").strip()

        if non_empty(name_en) or non_empty(short_en) or non_empty(desc_en):
            updates = []
            if non_empty(name_en):
                updates.append(f"item_name='{sql_escape(name_en)}'")
            if non_empty(short_en):
                updates.append(f"item_short_description='{sql_escape(short_en)}'")
            if non_empty(desc_en):
                updates.append(f"item_description='{sql_escape(desc_en)}'")
            if updates:
                statements.append(
                    "UPDATE st_item "
                    f"SET {', '.join(updates)} "
                    f"WHERE item_id={item_id};"
                )

        for language, name_value, short_value, desc_value in (
            ("en", name_en, short_en, desc_en),
            ("ru", name_ru, short_ru, desc_ru),
            ("tk", name_tm, short_tm, desc_tm),
        ):
            if not non_empty(name_value) and not non_empty(short_value) and not non_empty(desc_value):
                continue

            statements.append(
                "DELETE FROM st_item_translation "
                f"WHERE item_id={item_id} AND language='{language}';"
            )
            statements.append(
                "INSERT INTO st_item_translation "
                "(merchant_id, item_id, language, item_name, item_description, item_short_description) "
                "SELECT 0, item_id, "
                f"'{language}', "
                f"'{sql_escape(name_value)}', "
                f"'{sql_escape(desc_value)}', "
                f"'{sql_escape(short_value)}' "
                "FROM st_item "
                f"WHERE item_id={item_id};"
            )

    statements.append("COMMIT;")
    return "\n".join(statements) + "\n"


def run_remote_command(ssh, command: str, timeout: int = 120) -> tuple[str, str]:
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    return out, err


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True)
    parser.add_argument("--host", required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--db-name", required=True)
    parser.add_argument("--db-user", required=True)
    parser.add_argument("--db-password", required=True)
    args = parser.parse_args()

    csv_path = Path(args.csv)
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    sql = build_sql(rows)

    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    remote_dir = f"/root/tagam_item_import_{stamp}"
    remote_sql = f"{remote_dir}/import_items.sql"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        args.host,
        port=args.port,
        username=args.user,
        password=args.password,
        timeout=20,
    )

    out, err = run_remote_command(
        ssh,
        f"mkdir -p {remote_dir} && "
        f"mysqldump --no-tablespaces -u{args.db_user} -p'{args.db_password}' "
        f"--default-character-set=utf8mb4 {args.db_name} "
        "st_item st_item_translation "
        f"> {remote_dir}/backup_before_import.sql",
        timeout=180,
    )
    if err and "Warning" not in err:
        raise RuntimeError(err)

    sftp = ssh.open_sftp()
    with sftp.open(remote_sql, "w") as f:
        f.write(sql)
    sftp.close()

    out, err = run_remote_command(
        ssh,
        f"mysql -u{args.db_user} -p'{args.db_password}' "
        f"-D {args.db_name} --default-character-set=utf8mb4 < {remote_sql}",
        timeout=180,
    )
    if err and "Warning" not in err:
        raise RuntimeError(err)

    item_ids = ",".join(row["id"] for row in rows[:5])
    verify_query = (
        "SELECT i.item_id, i.item_name, i.item_short_description, "
        "COALESCE(MAX(CASE WHEN t.language='ru' THEN t.item_name END),'') AS ru_name, "
        "COALESCE(MAX(CASE WHEN t.language='tk' THEN t.item_name END),'') AS tk_name "
        "FROM st_item i "
        "LEFT JOIN st_item_translation t ON t.item_id=i.item_id "
        f"WHERE i.item_id IN ({item_ids}) "
        "GROUP BY i.item_id, i.item_name, i.item_short_description "
        "ORDER BY i.item_id;"
    )
    out, err = run_remote_command(
        ssh,
        f"mysql -u{args.db_user} -p'{args.db_password}' "
        f"-D {args.db_name} --default-character-set=utf8mb4 -B -e \"{verify_query}\"",
        timeout=120,
    )
    ssh.close()

    print(
        json.dumps(
            {
                "remote_dir": remote_dir,
                "rows_imported": len(rows),
                "verify_preview": out,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
