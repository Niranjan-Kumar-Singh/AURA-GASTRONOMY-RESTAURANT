# AURA Digital Dining - Development & Coding Constitution

> **Master Engineering Rule**:
> *"Never generate unnecessary complexity. Prefer production-quality simplicity over enterprise-level overengineering. Every technology or pattern must solve a real problem in the current phase of development."*

---

## 1. General Engineering Guidelines

1. **Strict Type Safety**: TypeScript strict mode enforced on the frontend; explicit return types required on all functions and hooks. No implicit `any`.
2. **Immutability & Pure Logic**: Business logic and state mutations must maintain immutability. Use pure helper functions for calculations.
3. **No Dead / Placeholder Code**: No `console.log` statements in production files. Remove commented-out legacy code blocks.
4. **Self-Documenting Code**: Variable names must explicitly state intent (`isMenuItemAvailable`, `tableOrderTotalAmount`) rather than cryptic abbreviations (`x`, `flag`, `data1`).

---

## 2. React 19 Frontend Constitution

1. **Functional Components Only**: Class components are forbidden. All components must be declared as standard functional components.
2. **Explicit Props Contract**: Every component must declare its `Props` interface directly above the component definition in the same file.
3. **Style Encapsulation**: Inline CSS styling is strictly prohibited. Styling must use Tailwind CSS utility classes exclusively.
4. **Custom Hook Isolation**: Business logic, data fetching hooks, and complex side-effects must be encapsulated in custom hooks located in `/hooks` or `/features/<feature-name>/hooks`.
5. **UI State Integrity**: Every user-facing component/screen must handle 7 core states (`Initial`, `Loading`, `Empty`, `Error`, `Success`, `Offline`, `Unauthorized`).

---

## 3. Java 21 & Spring Boot 3 Backend Constitution

1. **Layered Isolation**: Strict flow: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`.
2. **Dependency Injection**: Field injection (`@Autowired`) is forbidden. Always use constructor injection via Lombok `@RequiredArgsConstructor`.
3. **DTO Immutability**: All Request and Response payloads must be defined using Java 21 `record` types.
4. **Exception Handling**: Controllers must never return unhandled raw stack traces. All business errors must extend `BaseDomainException` and be caught by `@RestControllerAdvice` to output uniform JSON error payloads.
5. **Transactional Boundary**: All service methods modifying state must be annotated with `@Transactional(rollbackFor = Exception.class)`. Pure read queries must be annotated with `@Transactional(readOnly = true)`.

---

## 4. Database & Persistence Constitution

1. **Naming Standard**: Database table names, column names, and indices must use `snake_case`. Table names must be pluralized (`menu_items`, `orders`).
2. **Primary Key Standard**: Primary keys must be `BIGINT GENERATED ALWAYS AS IDENTITY`.
3. **Audit Baseline**: Operational entities must inherit from `BaseEntity` (`created_at`, `updated_at`, `is_deleted`).
4. **SQL Parameterization**: Zero string concatenation in SQL or HQL queries. All queries must use parameterized binding to prevent SQL injection.

---

## 5. Git Commit & Code Review Constitution

1. **Commit Message Format**: Follow Conventional Commits: `<type>(<scope>): <short description>`.
   - Examples: `feat(order): add websocket status update listener`, `fix(menu): resolve availability toggle bug`.
2. **PR Size Limit**: Pull requests must not exceed 400 lines of code change.
3. **Green Build Guarantee**: CI pipeline (linting + Vitest + JUnit) must pass 100% clean before code merge.
