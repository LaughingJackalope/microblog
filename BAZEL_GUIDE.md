# Bazel Build System Guide

## Overview

This project uses [Bazel](https://bazel.build/) to provide a unified, cache-optimized build system across both Python and Next.js services. Bazel dramatically improves agent and developer experience by:

- **Incremental builds**: Only rebuild what changed
- **Caching**: Reuse previous build/test results  
- **Discoverability**: Query all available targets programmatically
- **Hermetic builds**: Reproducible across machines
- **Unified interface**: Same commands for all services

## Quick Start

### Using Make (Recommended for Beginners)

```bash
# Show all available commands
make help

# Run fast quality checks (linting + typecheck)
make validate

# Start development servers
make dev

# Run all tests
make test

# Sync types (Pydantic → TypeScript)
make sync
```

### Using Bazel Directly (Advanced)

```bash
# List all available targets
bazel query '//...'

# Run Python typechecking
bazel run //microblog-python:typecheck

# Run Next.js tests
bazel run //microblog-next:test

# Build all inner loop checks (fast)
bazel build //:inner_loop
```

## Architecture

### Target Structure

```
microblog/
├── BUILD.bazel                    # Root targets (inner_loop, outer_loop)
├── WORKSPACE.bazel                # Workspace configuration
├── .bazelrc                       # Bazel settings (caching, performance)
├── .bazelignore                   # Excluded directories
│
├── microblog-python/
│   ├── BUILD.bazel                # Python service targets
│   └── run_*.sh                   # Wrapper scripts
│
└── microblog-next/
    ├── BUILD.bazel                # Next.js service targets
    └── run_*.sh                   # Wrapper scripts
```

### Inner Loop vs Outer Loop

**Inner Loop** (< 30s) - Fast feedback for local development:
- Type checking (Python + TypeScript)
- Linting (ruff + ESLint)
- Unit tests (pytest + Vitest)

**Outer Loop** (5-10 min) - Comprehensive quality for CI/CD:
- All inner loop checks
- E2E tests (Playwright)
- Visual regression tests
- Server Action mutation tests

## Common Commands

### Development

```bash
# Start both services
bazel run :dev
# Or with Make
make dev

# Start only Python backend
bazel run //microblog-python:dev
make python-dev

# Start only Next.js frontend
bazel run //microblog-next:dev
make next-dev
```

### Testing

```bash
# Run all tests
bazel build //:inner_loop
make test

# Run Python tests only
bazel run //microblog-python:test
make python-test

# Run Next.js tests only
bazel run //microblog-next:test
make next-test

# Run E2E tests
bazel run //microblog-next:e2e

# Run visual regression tests
bazel run //microblog-next:e2e_visual
```

### Linting & Type Checking

```bash
# Fast quality checks (both services)
bazel build //:inner_loop_fast_checks
make validate

# Python linting
bazel run //microblog-python:lint_check
make python-lint

# Next.js linting
bazel run //microblog-next:lint_check
make next-lint

# Auto-fix all linting issues
bazel run :lint_fix
make fix
```

### Type Generation

```bash
# Sync types (Pydantic → TypeScript → Zod)
bazel run :sync_types
make sync
```

### Database

```bash
# Run migrations
bazel run //microblog-python:migrate
make migrate
```

## Discovering Targets

Bazel provides powerful query capabilities:

```bash
# List all targets
bazel query '//...'

# List only test targets
bazel query 'tests(//...)'

# List targets in specific package
bazel query '//microblog-python:*'

# Find targets with specific tag
bazel query 'attr(tags, "inner_loop", //...)'

# Show target dependencies
bazel query 'deps(//microblog-python:test)'
```

## Caching & Performance

### Local Caching

Bazel automatically caches build and test results in `~/.cache/bazel/`.

```bash
# View cache statistics
bazel info

# Clear cache (rarely needed)
bazel clean
make clean

# Clear everything including downloaded dependencies
bazel clean --expunge
```

### Cache Hit Examples

**First run** (cold cache):
```bash
$ bazel run //microblog-python:typecheck
INFO: Elapsed time: 3.2s
```

**Second run** (warm cache):
```bash
$ bazel run //microblog-python:typecheck
INFO: Elapsed time: 0.3s  # 10x faster!
```

### Configuration Profiles

The `.bazelrc` defines different profiles:

- **`inner_loop`** (default): Fast, cached results
- **`outer_loop`**: No cache, full output
- **`ci`**: Optimized for CI environments
- **`dev`**: Verbose output for debugging

Use profiles:
```bash
# Use outer loop config
bazel test --config=outer_loop //...

# Use CI config
bazel test --config=ci //...
```

## Agent-Friendly Features

### 1. Programmatic Discovery

Agents can discover all targets:

```bash
$ bazel query '//...' --output=label
//:dev
//:inner_loop
//:inner_loop_fast_checks
//microblog-python:test
//microblog-next:test
...
```

### 2. JSON Output

For parsing by agents:

```bash
$ bazel query '//...' --output=jsonproto
```

### 3. Status Checking

```bash
# Check what needs building
bazel query 'kind(genrule, //...)'

# Show test targets
bazel query 'tests(//...)'
```

### 4. Make Integration

All Bazel commands are wrapped in Make for familiarity:

```bash
# Agent-friendly status command
make agent-status
```

## Troubleshooting

### Build Fails with "Permission Denied"

Ensure wrapper scripts are executable:

```bash
chmod +x microblog-python/run_*.sh
chmod +x microblog-next/run_*.sh
chmod +x *.sh
```

### "Target not found"

Verify the target exists:

```bash
bazel query '//microblog-python:*'
```

### Cache Issues

Clear the cache:

```bash
bazel clean
# Or
make clean
```

### Slow Builds

Check Bazel is using caching:

```bash
bazel info  # Shows cache directory
ls ~/.cache/bazel  # Verify cache exists
```

## Comparison: Before and After

### Before Bazel

```bash
# Different commands for each service
cd microblog-python && make test
cd microblog-next && npm test

# No caching - always re-runs everything
# No dependency tracking
# Manual coordination required
```

### After Bazel

```bash
# Unified commands
bazel test //...

# Intelligent caching (10x faster on re-runs)
# Automatic dependency tracking
# Discover all targets programmatically
```

## Advanced Usage

### Custom Targets

Add custom targets to `BUILD.bazel`:

```python
genrule(
    name = "my_command",
    outs = ["my_command.sh"],
    cmd = "cp $(location my_script.sh) $@ && chmod +x $@",
    srcs = ["my_script.sh"],
    executable = True,
)
```

Then run:
```bash
bazel run //:my_command
```

### Tags

Filter by tags:

```bash
# Run only inner loop tests
bazel test --test_tag_filters=inner_loop //...

# Run only unit tests
bazel test --test_tag_filters=unit //...

# Exclude E2E tests
bazel test --test_tag_filters=-e2e //...
```

### Parallel Execution

Bazel automatically parallelizes independent tasks:

```bash
# Both tests run in parallel
bazel test //microblog-python:test //microblog-next:test
```

## Integration with Existing Workflows

### Pre-commit Hooks

The pre-commit hook can be updated to use Bazel:

```bash
# In .git/hooks/pre-commit
bazel build //:inner_loop_fast_checks
```

### CI/CD

Example GitHub Actions:

```yaml
- name: Run inner loop
  run: bazel test --config=ci //:inner_loop

- name: Run outer loop
  run: bazel test --config=ci //:outer_loop
```

### VS Code

Add to `.vscode/tasks.json`:

```json
{
  "label": "Bazel Test",
  "type": "shell",
  "command": "bazel test //..."
}
```

## Best Practices

1. **Use Make for common tasks**: `make validate`, `make test`
2. **Use Bazel for precision**: `bazel run //microblog-python:lint_check`
3. **Query before running**: `bazel query '//...'` to discover targets
4. **Let Bazel cache**: Don't clean unless necessary
5. **Tag appropriately**: Use `inner_loop` and `outer_loop` tags

## Resources

- [Bazel Documentation](https://bazel.build/docs)
- [Bazel Query Guide](https://bazel.build/query/guide)
- [Best Practices](https://bazel.build/configure/best-practices)

## Summary

Bazel provides:
- ✅ **Unified build system** across Python and Next.js
- ✅ **Intelligent caching** (10x faster re-runs)
- ✅ **Discoverability** for agents (`bazel query`)
- ✅ **Backwards compatibility** via Make
- ✅ **Clear inner/outer loop** separation

**For agents**: Use `bazel query '//...'` to discover all targets, then `bazel run <target>` to execute.

**For humans**: Use `make help` to see available commands, then `make <command>` for common tasks.
