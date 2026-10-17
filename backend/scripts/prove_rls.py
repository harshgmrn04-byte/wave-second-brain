"""Run a rollback-only two-identity RLS check against the development database.

Usage: from backend/, .venv/bin/python scripts/prove_rls.py
The script never prints the connection string or synthetic note bodies.
"""

import os
from pathlib import Path
from uuid import uuid4

import psycopg
from dotenv import load_dotenv


def main() -> None:
    load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")
    database_url = os.environ.get("WAVE_DATABASE_URL")
    if not database_url:
        raise SystemExit("WAVE_DATABASE_URL is missing from backend/.env.local")

    first_user, second_user = uuid4(), uuid4()
    with psycopg.connect(database_url, autocommit=False, connect_timeout=8) as connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "select current_user, rolbypassrls, rolsuper "
                    "from pg_roles where rolname = current_user"
                )
                role, bypass_rls, superuser = cursor.fetchone()
                assert role == "wave_api" and not bypass_rls and not superuser, (
                    "Connection is not the limited wave_api role"
                )
                cursor.execute("select pg_has_role(current_user, 'postgres', 'member')")
                assert not cursor.fetchone()[0], "Runtime role belongs to postgres"

                cursor.execute("select count(*) from wave.resources")
                assert cursor.fetchone()[0] == 0, "Missing identity exposed resources"

                cursor.execute("select set_config('wave.user_id', %s, true)", (str(first_user),))
                cursor.execute(
                    "insert into wave.resources (owner_id, body) values (%s, %s) returning id",
                    (first_user, "Synthetic RLS proof note"),
                )
                resource_id = cursor.fetchone()[0]

                cursor.execute("select count(*) from wave.resources where id = %s", (resource_id,))
                assert cursor.fetchone()[0] == 1, "Owner cannot read their note"

                cursor.execute("select set_config('wave.user_id', %s, true)", (str(second_user),))
                cursor.execute("select count(*) from wave.resources where id = %s", (resource_id,))
                assert cursor.fetchone()[0] == 0, "Other user can read the note"

                cursor.execute("delete from wave.resources where id = %s returning id", (resource_id,))
                assert cursor.fetchone() is None, "Other user can mutate the note"

                cursor.execute("savepoint wrong_owner")
                try:
                    cursor.execute(
                        "insert into wave.resources (owner_id, body) values (%s, %s)",
                        (first_user, "Wrong owner"),
                    )
                except psycopg.errors.InsufficientPrivilege:
                    cursor.execute("rollback to savepoint wrong_owner")
                else:
                    raise AssertionError("RLS accepted a mismatched owner on insert")

                cursor.execute("select set_config('wave.user_id', %s, true)", (str(first_user),))
                cursor.execute("select count(*) from wave.resources where id = %s", (resource_id,))
                assert cursor.fetchone()[0] == 1, "Other user's deletion changed the note"
                cursor.execute("delete from wave.resources where id = %s returning id", (resource_id,))
                assert cursor.fetchone()[0] == resource_id, "Owner cannot delete their note"

            connection.rollback()
            with connection.cursor() as cursor:
                cursor.execute("select current_setting('wave.user_id', true)")
                assert cursor.fetchone()[0] in (None, ""), "User identity leaked past transaction"
                cursor.execute("select count(*) from wave.resources")
                assert cursor.fetchone()[0] == 0, "Rollback left a synthetic note behind"

            print("PASS: limited role, transaction reset, owner read/delete, cross-user read/write denial")
        finally:
            connection.rollback()


if __name__ == "__main__":
    main()
