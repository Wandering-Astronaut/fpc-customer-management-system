# Pre-planned Git commit history

Use these commits in order when pushing to your public repository. Each commit is one logical slice of the exam deliverable.

---

## Commit 1 — `chore: initialize repository with environment templates`

**Message:**
```
chore: initialize repository with environment templates
```

**What's included:**
- `.gitignore` — ignores vendor, node_modules, `.env`, logs, caches
- `.env.example` — root Compose variables (`APP_KEY`, DB credentials)

**Why:** Establishes the mono-repo and keeps secrets out of git.

---

## Commit 2 — `feat(docker): orchestrate api, controller, database, and searcher services`

**Message:**
```
feat(docker): orchestrate api, controller, database, and searcher services
```

**What's included:**
- `docker-compose.yml` — four services: `api`, `controller`, `database`, `searcher`
- `nginx/Dockerfile`, `nginx/nginx.conf` — Nginx load balancer → PHP-FPM upstream
- `api/Dockerfile` — PHP 8.3-FPM, Composer install, custom entrypoint (no Sail)
- `api/docker-entrypoint.sh` — wait for Postgres, migrate, bootstrap ES index

**Why:** Satisfies exam requirement for custom Docker Compose with all four named services.

---

## Commit 3 — `feat(api): scaffold Laravel application and configuration`

**Message:**
```
feat(api): scaffold Laravel application and configuration
```

**What's included:**
- `api/composer.json` — Laravel 11, Guzzle (no Scout)
- `api/bootstrap/app.php`, `api/artisan`, `api/public/index.php`
- `api/config/` — app, database, cors, elasticsearch, cache, logging
- `api/routes/web.php` — health JSON at `/`
- `api/.env.example`
- `api/storage/**` — framework cache, sessions, views, app paths

**Why:** Backend foundation before domain code.

---

## Commit 4 — `feat(api): add customer model, migration, and validation layer`

**Message:**
```
feat(api): add customer model, migration, and validation layer
```

**What's included:**
- `api/app/Models/Customer.php` — fillable fields, soft deletes, `full_name` accessor
- `api/database/migrations/2024_01_01_000000_create_customers_table.php` — unique email
- `api/database/factories/CustomerFactory.php`, `api/database/seeders/DatabaseSeeder.php`
- `api/app/Http/Requests/StoreCustomerRequest.php`, `UpdateCustomerRequest.php`
- `api/app/Http/Resources/CustomerResource.php`

**Why:** Customer data requirements (first name, last name, email, contact, unique email).

---

## Commit 5 — `feat(api): implement customer CRUD API endpoints`

**Message:**
```
feat(api): implement customer CRUD API endpoints
```

**What's included:**
- `api/app/Http/Controllers/CustomerController.php` — index, store, show, update, destroy
- `api/app/Services/CustomerService.php` — business logic, list/search orchestration
- `api/routes/api.php` — `Route::apiResource('customers', ...)`
- `api/app/Providers/AppServiceProvider.php` — DI bindings

**Why:** Core CRUD API required by the exam.

---

## Commit 6 — `feat(api): sync customers to Elasticsearch via Guzzle HTTP client`

**Message:**
```
feat(api): sync customers to Elasticsearch via Guzzle HTTP client
```

**What's included:**
- `api/app/Contracts/ElasticsearchServiceInterface.php`
- `api/app/Services/ElasticsearchService.php` — index, delete, search, setup (Guzzle only)
- `api/app/Console/Commands/SetupElasticsearchCommand.php`
- `api/config/elasticsearch.php`
- `api/routes/console.php` — artisan command registration

**Why:** Searcher service sync without Laravel Scout; list endpoint search by name/email.

---

## Commit 7 — `test(api): add PHPUnit unit and feature tests`

**Message:**
```
test(api): add PHPUnit unit and feature tests
```

**What's included:**
- `api/phpunit.xml` — SQLite in-memory for tests
- `api/tests/CreatesApplication.php`, `api/tests/TestCase.php`
- `api/tests/Unit/CustomerServiceTest.php` — create/update/delete + ES mock
- `api/tests/Unit/ElasticsearchServiceTest.php` — Guzzle MockHandler
- `api/tests/Feature/CustomerApiTest.php` — full CRUD HTTP tests, ES sync assertion on create

**Why:** Unit/integration testing with PHPUnit (exam recommendation).

---

## Commit 8 — `feat(frontend): add React customer management UI`

**Message:**
```
feat(frontend): add React customer management UI
```

**What's included:**
- `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`
- `frontend/src/main.jsx`, `App.jsx`, `styles.css`
- `frontend/src/services/` — Axios client for Laravel API (not the backend)
- `frontend/src/hooks/useCustomers.js` — debounced search + pagination
- `frontend/src/pages/CustomersPage.jsx` — list, search, CRUD modals
- `frontend/src/components/` — CustomerForm, CustomerDetail, DeleteConfirm (Bootstrap modals)

**Why:** React frontend with CRUD UI and search; `services/` avoids confusion with root `/api` backend.

---

## Commit 9 — `docs: add README with architecture and setup instructions`

**Message:**
```
docs: add README with architecture and setup instructions
```

**What's included:**
- `README.md` — tech stack, architecture diagram, quick start, API reference, tests, SOLID table, folder naming note

**Why:** Exam requires concise run instructions in root `README.md`.

---

## Commit 10 — `fix: harden test bootstrap, React 19, Bootstrap npm, and storage paths`

**Message:**
```
fix: harden test bootstrap, React 19, Bootstrap npm, and storage paths
```

**What's included:**
- `api/tests/CreatesApplication.php` — Laravel test bootstrap
- `api/tests/Unit/CustomerServiceTest.php` — `RefreshDatabase`
- `api/docker-entrypoint.sh` — ensure storage framework dirs exist
- `api/storage/framework/**` — tracked empty dirs
- `frontend/package.json` — React 19, Bootstrap 5 via npm
- `frontend/src/main.jsx` — import Bootstrap CSS
- Bootstrap modals/tables in components; theme overrides in `styles.css`
- Renamed `frontend/src/api/` → `frontend/src/services/`
- `COMMIT_PLAN.md` (this file)
- `composer.lock`, `package-lock.json` (when generated)

**Why:** Closes gaps for exam compliance (latest React, proper Bootstrap, runnable tests, clear folder names).

---

## After pushing

1. Create a **public** repo on GitHub/GitLab.
2. Run: `git remote add origin <your-url>`
3. Run: `git push -u origin main`
4. Submit the public URL before the 48-hour deadline.

## Quick commands (run from project root)

```powershell
git init
git add -A
# Or add per-commit using paths from each section above
git commit -m "chore: initialize repository with environment templates"
# ... repeat for commits 2–10
git branch -M main
git remote add origin https://github.com/YOUR_USER/fpc-customer-app.git
git push -u origin main
```
