"""One-time development migration; never uses admin credentials at API runtime.

Run from backend/: .venv/bin/python scripts/setup_dev_db.py
The password prompt does not echo or store the postgres password. The generated
limited-role password is written only to ignored backend/.env.local.
"""

import getpass
import os
import secrets
from pathlib import Path
from urllib.parse import quote, urlparse

import psycopg
from dotenv import load_dotenv
from psycopg import sql

BACKEND = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND / ".env.local"
MIGRATION = BACKEND / "migrations" / "0001_private_notes.sql"


def main() -> None:
    load_dotenv(ENV_FILE)
    if not ENV_FILE.exists():
        raise SystemExit("Create backend/.env.local from backend/.env.example first.")
    if os.environ.get("WAVE_DATABASE_URL"):
        raise SystemExit("A limited database URL is already set; setup was not repeated.")
    project_url = os.environ.get("WAVE_SUPABASE_URL", "")
    project_host = urlparse(project_url).hostname or ""
    if not project_host.endswith(".supabase.co"):
        raise SystemExit("Set the development project URL in backend/.env.local first.")
    project_ref = project_host.removesuffix(".supabase.co")

    print("Project:", project_ref)
    print("Copy the Session pooler host from this project's Supabase Connect dialog.")
    pooler_host = input("Session pooler host: ").strip()
    if not pooler_host.endswith(".pooler.supabase.com") or ":" in pooler_host:
        raise SystemExit("Expected only the Session pooler hostname, without port or URL.")
    admin_password = getpass.getpass("Development project's postgres password: ")
    if not admin_password:
        raise SystemExit("No password entered.")

    limited_password = secrets.token_urlsafe(36)
    try:
        with psycopg.connect(
            host=pooler_host,
            port=5432,
            user=f"postgres.{project_ref}",
            password=admin_password,
            dbname="postgres",
            sslmode="require",
            connect_timeout=8,
        ) as connection, connection.cursor() as cursor:
            cursor.execute("select current_user")
            if cursor.fetchone()[0] != "postgres":
                raise RuntimeError("Expected the postgres migration role; no changes applied.")
            cursor.execute(
                "select to_regclass('wave.resources') is not null, "
                "exists(select 1 from pg_roles where rolname = 'wave_api')"
            )
            table_exists, role_exists = cursor.fetchone()
            if table_exists != role_exists:
                raise RuntimeError("Partial or conflicting setup found; inspect the development project.")
            if not table_exists:
                cursor.execute(MIGRATION.read_text())
            cursor.execute(
                sql.SQL("alter role wave_api password {}").format(sql.Literal(limited_password))
            )
    except psycopg.Error as cause:
        raise SystemExit(f"Migration failed ({cause.sqlstate or type(cause).__name__}); no API role was configured.") from None
    finally:
        admin_password = ""

    runtime_url = (
        f"postgresql://wave_api.{project_ref}:{quote(limited_password, safe='')}@"
        f"{pooler_host}:5432/postgres?sslmode=require"
    )
    lines = ENV_FILE.read_text().splitlines()
    if not any(line.startswith("WAVE_DATABASE_URL=") for line in lines):
        lines.append("WAVE_DATABASE_URL=" + runtime_url)
    else:
        lines = [
            "WAVE_DATABASE_URL=" + runtime_url if line.startswith("WAVE_DATABASE_URL=") else line
            for line in lines
        ]
    ENV_FILE.write_text("\n".join(lines) + "\n")
    os.chmod(ENV_FILE, 0o600)
    print("Migration applied; limited runtime URL saved in ignored backend/.env.local.")
    print("Run: .venv/bin/python scripts/prove_rls.py")


if __name__ == "__main__":
    main()
