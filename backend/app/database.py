"""Limited Postgres transactions with identity confined to each transaction."""

import logging
from collections.abc import Iterator
from contextlib import contextmanager
from uuid import UUID

import psycopg
from psycopg.rows import DictRow, dict_row

from app.config import get_settings

logger = logging.getLogger(__name__)


class DatabaseUnavailable(Exception):
    pass


@contextmanager
def user_transaction(user_id: UUID) -> Iterator[psycopg.Cursor[DictRow]]:
    database_url = get_settings().database_url
    if not database_url:
        raise DatabaseUnavailable("Limited database connection is not configured")

    try:
        with psycopg.connect(database_url, connect_timeout=8) as connection, connection.cursor(
            row_factory=dict_row
        ) as cursor:
            cursor.execute(
                "select current_user as role, rolbypassrls, rolsuper "
                "from pg_roles where rolname = current_user"
            )
            role = cursor.fetchone()
            if role is None or role["role"] != "wave_api" or role["rolbypassrls"] or role["rolsuper"]:
                raise DatabaseUnavailable("Database URL must use the limited wave_api role")
            cursor.execute("select set_config('statement_timeout', '5000', true)")
            cursor.execute("select set_config('wave.user_id', %s, true)", (str(user_id),))
            yield cursor
    except psycopg.Error as cause:
        logger.error("Database request failed: %s", cause.sqlstate or type(cause).__name__)
        raise DatabaseUnavailable("Database request failed") from cause
