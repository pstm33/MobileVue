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
    statements = [
        "START TRANSACTION;",
    ]

    for row in rows:
        cat_id = int(row["cat_id"])
        merchant_id = int(row["merchant_id"])

        target_en_name = (row.get("target_en_name") or "").strip()
        target_ru_name = (row.get("target_ru_name") or "").strip()
        target_tk_name = (row.get("target_tk_name") or "").strip()

        target_en_description = (row.get("target_en_description") or "").strip()
        target_ru_description = (row.get("target_ru_description") or "").strip()
        target_tk_description = (row.get("target_tk_description") or "").strip()

        if non_empty(target_en_name):
            if non_empty(target_en_description):
                statements.append(
                    "UPDATE st_category "
                    f"SET category_name='{sql_escape(target_en_name)}', "
                    f"category_description='{sql_escape(target_en_description)}' "
                    f"WHERE cat_id={cat_id} AND merchant_id={merchant_id};"
                )
            else:
                statements.append(
                    "UPDATE st_category "
                    f"SET category_name='{sql_escape(target_en_name)}' "
                    f"WHERE cat_id={cat_id} AND merchant_id={merchant_id};"
                )

        for language, name_value, desc_value in (
            ("en", target_en_name, target_en_description),
            ("ru", target_ru_name, target_ru_description),
            ("tk", target_tk_name, target_tk_description),
        ):
            if not non_empty(name_value) and not non_empty(desc_value):
                continue

            statements.append(
                "DELETE FROM st_category_translation "
                f"WHERE cat_id={cat_id} "
                f"AND language='{language}';"
            )
            statements.append(
                "INSERT INTO st_category_translation "
                "(merchant_id, cat_id, language, category_name, category_description) "
                "VALUES "
                f"(0, {cat_id}, '{language}', "
                f"'{sql_escape(name_value)}', '{sql_escape(desc_value)}');"
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
    remote_dir = f"/root/tagam_category_import_{stamp}"
    remote_sql = f"{remote_dir}/import_categories.sql"

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
        "st_category st_category_translation "
        f"> {remote_dir}/backup_before_import.sql",
        timeout=120,
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
        timeout=120,
    )
    if err and "Warning" not in err:
        raise RuntimeError(err)

    verify_query = (
        "SELECT c.cat_id, c.merchant_id, c.category_name, "
        "COALESCE(MAX(CASE WHEN t.language='ru' THEN t.category_name END),'') AS ru_name, "
        "COALESCE(MAX(CASE WHEN t.language='tk' THEN t.category_name END),'') AS tk_name "
        "FROM st_category c "
        "LEFT JOIN st_category_translation t ON t.cat_id=c.cat_id "
        "GROUP BY c.cat_id, c.merchant_id, c.category_name "
        "ORDER BY c.cat_id LIMIT 10;"
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
