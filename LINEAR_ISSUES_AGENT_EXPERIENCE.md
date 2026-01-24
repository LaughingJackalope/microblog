# Linear Issues: Agent Experience Acceleration

Create these issues in Linear to systematically improve agent-driven development workflow.

---

## Issue 1: Unified Type Generation Command
**Type:** Task  
**Priority:** High  
**Labels:** `dx`, `tooling`, `type-safety`, `agent-experience`  
**Estimate:** 3 points

### Description
Create a single command that regenerates the entire type-safe tunnel (Pydantic → TypeScript → Zod) automatically.

**Problem:**
Currently, updating a Pydantic model requires 4 manual steps across multiple files. Agents must coordinate changes in Python, TypeScript generation, Zod schemas, and tests.

**Solution:**
Build `scripts/sync-types.sh` that:
- Regenerates TypeScript types from Pydantic models
- Auto-generates or updates Zod schemas from Pydantic constraints
- Validates all three layers are in sync
- Reports changes in structured format (JSON output for agents)

**Acceptance Criteria:**
- [ ] `make sync-types` command works from project root
- [ ] Automatically detects which Pydantic models changed
- [ ] Generates TypeScript types in `microblog-next/src/types/generated/`
- [ ] Updates or generates Zod schemas with matching constraints (max_length, email, etc.)
- [ ] Validation script confirms sync across all layers
- [ ] `--dry-run` and `--json` flags supported
- [ ] Integration test: change a Pydantic field → run command → verify TS and Zod updated

**Files to Create:**
- `scripts/sync-types.sh` - Main orchestrator
- `microblog-python/scripts/update_zod.py` - Zod generator from Pydantic
- `scripts/validate-type-sync.sh` - Enhanced validation
- Add `sync-types` target to root `Makefile`

---

## Issue 2: Auto-Fix Pre-commit Integration
**Type:** Task  
**Priority:** High  
**Labels:** `dx`, `tooling`, `pre-commit`, `agent-experience`  
**Estimate:** 2 points

### Description
Enhance pre-commit hooks to automatically fix issues when possible, reducing fix iteration cycles for agents.

**Problem:**
Pre-commit hooks catch errors quickly (<30s) but don't help fix them. Agents see "ESLint error" and must manually run `eslint --fix`, commit again, repeat. This creates 3-5 iteration cycles.

**Solution:**
Modify `.git/hooks/pre-commit` to:
- Run `eslint --fix` automatically before checking
- Run `ruff check --fix` automatically for Python
- Auto-format with existing formatters
- Only fail if issues remain after auto-fix
- Report what was fixed vs what needs manual work

**Acceptance Criteria:**
- [ ] Pre-commit auto-fixes ESLint violations when possible
- [ ] Pre-commit auto-fixes ruff violations when possible
- [ ] Clear output distinguishes: "Auto-fixed: 5 issues" vs "Manual fix needed: 2 issues"
- [ ] Backward compatible with existing hooks
- [ ] Environment variable `SKIP_AUTOFIX=1` disables auto-fix
- [ ] Reduces typical commit cycles from 3-5 to 1-2

**Files to Modify:**
- `.git/hooks/pre-commit` - Add auto-fix mode
- `scripts/validate-schemas.sh` - Add suggestions for common drift patterns

---

## Issue 3: Root Makefile with Agent-Friendly Targets
**Type:** Task  
**Priority:** High  
**Labels:** `dx`, `tooling`, `agent-experience`  
**Estimate:** 2 points

### Description
Create a root-level Makefile with standardized commands that agents can easily discover and use.

**Problem:**
Agents need to remember different commands for Python (`cd microblog-python && make dev`) vs Next.js (`cd microblog-next && npm run dev`). No unified interface.

**Solution:**
Create root `Makefile` with agent-optimized targets.

**Acceptance Criteria:**
- [ ] `make dev` - Start both services in parallel (or with tmux)
- [ ] `make sync` - Run type sync command
- [ ] `make test` - Run all tests (Python + Next.js + E2E)
- [ ] `make test-feature NAME=posts` - Run tests for specific feature
- [ ] `make validate` - Run all pre-commit checks without committing
- [ ] `make fix` - Auto-fix all fixable issues
- [ ] `make agent-status` - Show what needs attention (pending migrations, failing tests, drift, etc.)
- [ ] `make feature NAME=like-post` - Scaffold new feature (Phase 2)
- [ ] `make help` - List all targets with descriptions

**Files to Create:**
- `Makefile` at project root
- `scripts/agent-status.sh` - Status checker

---

## Issue 4: Test Scaffolding Generator
**Type:** Task  
**Priority:** Medium  
**Labels:** `dx`, `tooling`, `testing`, `agent-experience`, `scaffolding`  
**Estimate:** 5 points

### Description
Create a generator that scaffolds test suites across all three test layers (pytest, Vitest, Playwright) from a specification.

**Problem:**
Agents spend 20-40 minutes manually creating tests for each new feature across three frameworks with different patterns.

**Solution:**
Build `scripts/generate-tests.py` that generates test files from templates.

**Acceptance Criteria:**
- [ ] Command: `python scripts/generate-tests.py --model Post --operation create --endpoint /api/posts`
- [ ] Generates pytest test in `microblog-python/tests/test_posts.py`
- [ ] Generates Vitest test in `microblog-next/tests/actions/posts.test.ts`
- [ ] Generates Playwright test stub in `microblog-next/e2e/posts.spec.ts`
- [ ] Templates include common patterns: auth headers, error cases, validation tests
- [ ] `--dry-run` shows what would be generated
- [ ] `--json` outputs structured data
- [ ] Works with existing test structure (doesn't overwrite)

**Files to Create:**
- `scripts/generate-tests.py` - Main generator
- `scripts/templates/test.pytest.j2` - pytest template
- `scripts/templates/test.vitest.j2` - Vitest template  
- `scripts/templates/test.playwright.j2` - E2E template
- `docs/TEST_GENERATOR.md` - Usage guide

---

## Issue 5: Feature Scaffolding Command
**Type:** Task  
**Priority:** Medium  
**Labels:** `dx`, `tooling`, `scaffolding`, `agent-experience`  
**Estimate:** 8 points

### Description
Create end-to-end feature scaffolder that generates all layers of a new feature: backend, frontend, types, tests.

**Problem:**
Adding a new feature (e.g., "like post") requires coordinating 10+ files across both services. Agents spend 30-45 minutes on boilerplate.

**Solution:**
Build `scripts/scaffold-feature.py` that generates a complete feature stack from a specification.

**Acceptance Criteria:**
- [ ] Command: `make feature NAME=like-post` (calls scaffold script)
- [ ] Interactive prompts for: HTTP method, request/response models, authentication required
- [ ] Generates Pydantic models if they don't exist
- [ ] Generates FastAPI router endpoint in appropriate router file
- [ ] Generates Server Action in `microblog-next/src/actions/`
- [ ] Generates API client wrapper method in `microblog-next/src/lib/api.ts`
- [ ] Generates TypeScript types
- [ ] Generates Zod schema
- [ ] Generates test stubs for all layers
- [ ] Outputs checklist of manual steps (e.g., "Add route to main.py imports")
- [ ] `--dry-run` mode shows what would be created
- [ ] Compatible with existing code structure

**Files to Create:**
- `scripts/scaffold-feature.py` - Main scaffolder
- `scripts/templates/router.py.j2` - FastAPI router template
- `scripts/templates/action.ts.j2` - Server Action template
- `scripts/templates/api_client.ts.j2` - API client template
- `docs/SCAFFOLDING_GUIDE.md` - Comprehensive usage guide

**Dependencies:**
- Requires Issue 4 (Test Generator) completed first

---

## Issue 6: Documentation Drift Detection
**Type:** Task  
**Priority:** Low  
**Labels:** `dx`, `documentation`, `agent-experience`  
**Estimate:** 3 points

### Description
Automatically detect when code changes require documentation updates.

**Problem:**
Agents (and humans) forget to update docs. MASTERY_GUIDE.md, TESTING.md, and other docs go stale.

**Solution:**
Create `scripts/check-doc-drift.sh` that analyzes git diff and suggests doc updates.

**Acceptance Criteria:**
- [ ] Detects Pydantic model changes → suggests updating MASTERY_GUIDE.md
- [ ] Detects new test files → suggests updating TESTING.md
- [ ] Detects deployment changes → suggests updating DEPLOYMENT.md
- [ ] Outputs markdown checklist of docs to review
- [ ] Integrated into pre-commit as non-blocking warning
- [ ] `--json` output for agent consumption
- [ ] Patterns configurable in `.doc-patterns.json`

**Files to Create:**
- `scripts/check-doc-drift.sh` - Drift detector
- `.doc-patterns.json` - Pattern mapping config
- Integrate into `.git/hooks/pre-commit` (warning only)

---

## Issue 7: [SPIKE] Agent Workflow Time Measurement
**Type:** Spike  
**Priority:** Medium  
**Labels:** `spike`, `agent-experience`, `metrics`  
**Estimate:** 2 points  
**Timeboxed:** 1 day

### Description
Measure baseline and improved times for agent workflows to validate ROI of improvements.

**Goals:**
1. Establish baseline times for common agent tasks (before improvements)
2. Measure times after each improvement is deployed
3. Document methodology for reproducible measurements
4. Identify any additional friction points not yet captured

**Tasks:**
- [ ] Time "add new endpoint" workflow (manual)
- [ ] Time "update Pydantic model" workflow (manual)
- [ ] Time "add tests for feature" workflow (manual)
- [ ] Document each step and pain point
- [ ] After Issues 1-3 deployed: re-measure same workflows
- [ ] After Issues 4-5 deployed: re-measure same workflows
- [ ] Create comparison table and ROI analysis

**Deliverable:**
`docs/AGENT_WORKFLOW_METRICS.md` with:
- Baseline measurements
- Post-improvement measurements
- Time savings analysis
- Recommended next improvements

---

## Issue 8: Agent Workflow Documentation
**Type:** Documentation  
**Priority:** Medium  
**Labels:** `documentation`, `agent-experience`  
**Estimate:** 2 points

### Description
Create comprehensive guide for agents working in this codebase.

**Content to Include:**
- Quick reference of all `make` commands
- Common workflows with examples
- How to use scaffolding tools
- How to interpret pre-commit errors
- Where to find generated types
- Testing patterns for each layer
- Troubleshooting guide

**Acceptance Criteria:**
- [ ] `docs/AGENT_WORKFLOW.md` created
- [ ] Includes "Quick Start for Agents" section
- [ ] Command reference table
- [ ] Example workflows with expected outputs
- [ ] Linked from main README.md

**Files to Create:**
- `docs/AGENT_WORKFLOW.md`
- Update README.md with link

---

## Recommended Phases

### Phase 1: Foundation (Week 1)
**Goal:** Reduce friction in existing workflows
- Issue 1: Unified Type Generation Command (3 pts)
- Issue 2: Auto-Fix Pre-commit Integration (2 pts)
- Issue 3: Root Makefile with Agent-Friendly Targets (2 pts)

**Total: 7 points**

### Phase 2: Scaffolding (Week 2)
**Goal:** Accelerate new feature development
- Issue 4: Test Scaffolding Generator (5 pts)
- Issue 5: Feature Scaffolding Command (8 pts)

**Total: 13 points**

### Phase 3: Intelligence & Measurement (Week 3)
**Goal:** Continuous improvement and metrics
- Issue 6: Documentation Drift Detection (3 pts)
- Issue 7: Agent Workflow Time Measurement (2 pts)
- Issue 8: Agent Workflow Documentation (2 pts)

**Total: 7 points**

---

## Notes for Linear Import

**Team:** Use your default team (or create "Developer Experience" team)

**Labels to Create (if not existing):**
- `agent-experience` - Improvements specifically for AI agent workflows
- `dx` - Developer experience
- `tooling` - Build tools and automation
- `scaffolding` - Code generation and templates
- `spike` - Investigation tasks

**Priority Mapping:**
- High = Issues that directly reduce agent iteration time
- Medium = Accelerators for new work
- Low = Nice-to-have improvements

---

## Success Criteria for Full Initiative

After completing all issues:
- ✅ Type-safe tunnel updates: 15-30 min → **2-3 min**
- ✅ New endpoint development: 30-45 min → **5-10 min**  
- ✅ Test generation: 20-40 min → **3-5 min**
- ✅ Pre-commit fix cycles: 3-5 iterations → **1-2 iterations**
- ✅ Documentation drift: Often forgotten → **Automatic detection**

**Overall:** ~80% reduction in mechanical work for agents, allowing focus on business logic and architecture.
