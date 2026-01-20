"""Generate TypeScript types from Pydantic models."""

import json
from pathlib import Path

from app.models import (
    PostAuthor,
    PostCreate,
    PostList,
    PostPublic,
    TokenRequest,
    TokenResponse,
    UserCreate,
    UserPublic,
    UserUpdate,
)


def pydantic_to_ts_type(python_type: str) -> str:
    """Convert Python type hints to TypeScript types."""
    type_map = {
        "str": "string",
        "int": "number",
        "float": "number",
        "bool": "boolean",
        "datetime": "string",  # ISO 8601 format
        "None": "null",
    }

    # Handle optional types
    if " | None" in python_type:
        base_type = python_type.replace(" | None", "")
        ts_base = type_map.get(base_type, base_type)
        return f"{ts_base} | null"

    # Handle list types
    if python_type.startswith("list["):
        inner = python_type[5:-1]
        ts_inner = type_map.get(inner, inner)
        return f"{ts_inner}[]"

    return type_map.get(python_type, python_type)


def generate_typescript_interface(model_class, name: str | None = None) -> str:
    """Generate TypeScript interface from Pydantic model."""
    interface_name = name or model_class.__name__
    lines = [f"export interface {interface_name} {{"]

    schema = model_class.model_json_schema()

    for field_name, field_info in schema.get("properties", {}).items():
        field_type = field_info.get("type", "any")
        is_required = field_name in schema.get("required", [])

        # Handle different JSON schema types
        if field_type == "string":
            if field_info.get("format") == "date-time":
                ts_type = "string"  # ISO 8601
            elif field_info.get("format") == "email":
                ts_type = "string"
            else:
                ts_type = "string"
        elif field_type == "integer":
            ts_type = "number"
        elif field_type == "number":
            ts_type = "number"
        elif field_type == "boolean":
            ts_type = "boolean"
        elif field_type == "array":
            items = field_info.get("items", {})
            if "$ref" in items:
                ref_name = items["$ref"].split("/")[-1]
                ts_type = f"{ref_name}[]"
            else:
                item_type = items.get("type", "any")
                ts_type = f"{item_type}[]"
        elif "$ref" in field_info:
            ts_type = field_info["$ref"].split("/")[-1]
        else:
            ts_type = "any"

        optional_marker = "" if is_required else "?"
        lines.append(f"  {field_name}{optional_marker}: {ts_type};")

    lines.append("}")
    return "\n".join(lines)


def main():
    """Generate all TypeScript interfaces."""
    output = [
        "// Auto-generated TypeScript types from Pydantic models",
        "// DO NOT EDIT - Run 'make types' to regenerate",
        "",
    ]

    # Auth types
    output.append("// Authentication")
    output.append(generate_typescript_interface(TokenRequest))
    output.append("")
    output.append(generate_typescript_interface(TokenResponse))
    output.append("")

    # User types
    output.append("// Users")
    output.append(generate_typescript_interface(UserCreate))
    output.append("")
    output.append(generate_typescript_interface(UserUpdate))
    output.append("")
    output.append(generate_typescript_interface(UserPublic))
    output.append("")
    output.append(generate_typescript_interface(PostAuthor))
    output.append("")

    # Post types
    output.append("// Posts")
    output.append(generate_typescript_interface(PostCreate))
    output.append("")
    output.append(generate_typescript_interface(PostPublic))
    output.append("")
    output.append(generate_typescript_interface(PostList))
    output.append("")

    # Write to file
    output_path = Path(__file__).parent.parent / "generated" / "types.ts"
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text("\n".join(output))

    print(f"✅ Generated TypeScript types at: {output_path}")


if __name__ == "__main__":
    main()
