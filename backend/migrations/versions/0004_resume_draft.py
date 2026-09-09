"""resume builder draft storage

Revision ID: 0004_resume_draft
Revises: 0003_password_reset
Create Date: 2026-09-10
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_resume_draft"
down_revision: Union[str, None] = "0003_password_reset"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("resume_draft", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "resume_draft")
