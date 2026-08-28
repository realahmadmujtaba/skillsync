"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

role_enum = sa.Enum("student", "mentor", "admin", name="role")
stage_enum = sa.Enum("applied", "screening", "interview", "offer", name="stage")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", role_enum, nullable=False, server_default="student"),
        sa.Column("readiness", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "opportunities",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("company", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=160), nullable=False),
        sa.Column("location", sa.String(length=160), server_default=""),
        sa.Column("tags", sa.String(length=255), server_default=""),
        sa.Column("match", sa.Integer(), server_default="0"),
        sa.Column("posted", sa.String(length=40), server_default="new"),
    )

    op.create_table(
        "applications",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("company", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=160), nullable=False),
        sa.Column("match", sa.Integer(), server_default="0"),
        sa.Column("stage", stage_enum, nullable=False, server_default="applied"),
    )

    op.create_table(
        "interview_results",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("track", sa.String(length=40)),
        sa.Column("score", sa.Integer(), server_default="0"),
        sa.Column("feedback", sa.Text(), server_default=""),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("interview_results")
    op.drop_table("applications")
    op.drop_table("opportunities")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    stage_enum.drop(op.get_bind(), checkfirst=True)
    role_enum.drop(op.get_bind(), checkfirst=True)
