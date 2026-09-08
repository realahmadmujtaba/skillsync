"""resume analysis, dashboard, roadmap, google auth

Revision ID: 0002_resume_dashboard
Revises: 0001_initial
Create Date: 2026-09-07
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_resume_dashboard"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

skill_status_enum = sa.Enum("strong", "growing", "gap", name="skillstatus")


def upgrade() -> None:
    op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=True)
    op.add_column("users", sa.Column("google_sub", sa.String(length=255), nullable=True))
    op.create_index("ix_users_google_sub", "users", ["google_sub"], unique=True)
    op.add_column(
        "users",
        sa.Column(
            "target_role",
            sa.String(length=160),
            nullable=False,
            server_default="Software Engineer Intern",
        ),
    )

    op.create_table(
        "skill_assessments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("skill", sa.String(length=120), nullable=False),
        sa.Column("coverage", sa.Integer(), server_default="0"),
        sa.Column("status", skill_status_enum, nullable=False, server_default="gap"),
        sa.Column("note", sa.Text(), server_default=""),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "readiness_snapshots",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("score", sa.Integer(), server_default="0"),
        sa.Column("recorded_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("readiness_snapshots")
    op.drop_table("skill_assessments")
    skill_status_enum.drop(op.get_bind(), checkfirst=True)
    op.drop_column("users", "target_role")
    op.drop_index("ix_users_google_sub", table_name="users")
    op.drop_column("users", "google_sub")
    op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=False)
