"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-01-20 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=True),
        sa.Column('bio', sa.String(length=250), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    # Create indexes for users
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])

    # Create posts table
    op.create_table(
        'posts',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('content', sa.String(length=280), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('author_id', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for posts
    op.create_index('ix_posts_author_id', 'posts', ['author_id'])
    op.create_index('ix_posts_created_at', 'posts', ['created_at'])

    # Create followers association table
    op.create_table(
        'followers',
        sa.Column('follower_id', sa.String(length=50), nullable=False),
        sa.Column('followed_id', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['follower_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['followed_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('follower_id', 'followed_id')
    )

    # Create indexes for followers
    op.create_index('ix_followers_follower_id', 'followers', ['follower_id'])
    op.create_index('ix_followers_followed_id', 'followers', ['followed_id'])


def downgrade() -> None:
    op.drop_index('ix_followers_followed_id', table_name='followers')
    op.drop_index('ix_followers_follower_id', table_name='followers')
    op.drop_table('followers')

    op.drop_index('ix_posts_created_at', table_name='posts')
    op.drop_index('ix_posts_author_id', table_name='posts')
    op.drop_table('posts')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
