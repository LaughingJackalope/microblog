.PHONY: install dev migrate run test format lint clean

install:
	pip install -e ".[dev]"

dev:
	uvicorn app.main:app --reload --port 8000

migrate:
	alembic upgrade head

revision:
	alembic revision --autogenerate -m "$(msg)"

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

test:
	pytest

format:
	ruff format .

lint:
	ruff check .

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

types:
	pydantic2ts --module app.models --output ../microblog-next/types/api.ts

db-up:
	docker run --name microblog-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=microblog -p 5432:5432 -d postgres:16

db-down:
	docker stop microblog-db && docker rm microblog-db
