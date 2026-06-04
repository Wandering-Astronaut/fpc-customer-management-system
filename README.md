# FPC Customer Management System

A full-stack **customer CRUD** application built for the **FPC technical exam** (Docker, Laravel, React, Elasticsearch, PHPUnit).

## Exam requirements — how this project meets them

| Exam requirement                           | Implementation                                          |
| ------------------------------------------ | ------------------------------------------------------- |
| CRUD + list/view customers                 | REST API + React `CustomersPage`                        |
| Fields: name, unique email, contact        | Validation on create/update (see below)                 |
| Docker Compose (5 services)                | `api`, `controller`, `database`, `searcher`, `frontend` |
| Laravel + React + Bootstrap                | `api/` + `frontend/`                                    |
| PostgreSQL + Elasticsearch sync (no Scout) | Guzzle HTTP to `searcher`                               |
| Search on list by name/email               | `GET /api/customers?search=`                            |
| PHPUnit tests + README + SOLID             | `api/tests/`, this file, layered services               |

**Not required:** authentication, RBAC, multi-page routing.

## Tech Stack

| Layer                          | Technology                    |
| ------------------------------ | ----------------------------- |
| **Backend**                    | Laravel 11 (PHP 8.3)          |
| **Frontend**                   | React 19 + Vite + Bootstrap 5 |
| **Database**                   | PostgreSQL 16                 |
| **Search**                     | Elasticsearch 8.13            |
| **Controller / Load Balancer** | Nginx 1.25                    |
| **Containerisation**           | Docker + Docker Compose       |

## Architecture Overview
Browser
│
▼
┌─────────────┐
│  frontend   │  React 19 + Vite (port 3000, containerised)
│  (port 3000)│  Proxies /api requests to controller
└──────┬──────┘
│ HTTP proxy
▼
┌─────────────┐
│  controller │  Nginx – forwards requests to the API via FastCGI
│  (port 80)  │  Acts as a load balancer (scale api replicas freely)
└──────┬──────┘
│ FastCGI
▼
┌──────────────┐       ┌──────────────┐
│     api      │──────▶│   database   │  PostgreSQL
│  (Laravel)   │       │  (port 5432) │
└──────┬───────┘       └──────────────┘
│ HTTP (Guzzle)
▼
┌──────────────┐
│   searcher   │  Elasticsearch (port 9200, internal only)
└──────────────┘

> **Note:** Elasticsearch is only accessible within the Docker network. The Laravel API communicates with it using Guzzle — **no Laravel Scout** is used.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- [Docker Compose](https://docs.docker.com/compose/) v2 (bundled with Docker Desktop)

---

## Quick Start

### 1 — Clone the repository
git clone <your-repo-url>
cd fpc-customer-app

### 2 — Configure environment
cp .env.example .env
cp api/.env.example api/.env

Generate an application key (requires PHP locally, **or** skip and let the container do it):
Option A – local PHP
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
Paste the output as APP_KEY= in both .env and api/.env
Option B – Docker (run after step 3)
docker compose exec api php artisan key:generate

### 3 — Build and start all services
docker compose up --build -d

This will:

1. Build the `api` image (PHP-FPM + Composer install)
2. Build the `controller` image (Nginx)
3. Build the `frontend` image (Node 20 + Vite)
4. Pull `postgres:16-alpine` and `elasticsearch:8.13.4`
5. Run database migrations automatically
6. Create the Elasticsearch `customers` index automatically

> **First boot may take 2–3 minutes** while Elasticsearch initialises.

### 4 — Verify services are running
docker compose ps

All five services should show `Up` / `healthy`.
Quick API health check
curl http://localhost/
→ {"service":"FPC Customer API","status":"OK"}

### 5 — Open the app

Open <http://localhost:3000> in your browser.

> The Vite dev server proxies all `/api` requests to `http://localhost:80` (Nginx → Laravel).

---

## API Reference

Base URL: `http://localhost/api`

| Method   | Endpoint                        | Description                               |
| -------- | ------------------------------- | ----------------------------------------- |
| `GET`    | `/customers`                    | List customers (paginated)                |
| `GET`    | `/customers?search=john`        | Search by name or email via Elasticsearch |
| `GET`    | `/customers?page=2&per_page=10` | Pagination controls                       |
| `POST`   | `/customers`                    | Create a customer                         |
| `GET`    | `/customers/{id}`               | View a customer                           |
| `PUT`    | `/customers/{id}`               | Update a customer                         |
| `DELETE` | `/customers/{id}`               | Delete a customer                         |

### Customer payload

```json
{
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "email": "juan@example.com",
  "contact_number": "09175550123"
}
```

### Customer field rules

| Field             | Rules                                                                             |
| ----------------- | --------------------------------------------------------------------------------- |
| First / last name | 2–50 chars; letters, spaces, hyphens; title-cased                                 |
| Email             | Valid format, max 100 chars, unique among **active** customers                    |
| Contact           | Philippine mobile `09XXXXXXXXX`; UI format `09XX XXX XXXX` (e.g. `0917 555 0123`) |

After soft-delete, the same email may be registered again.

---

## Running Tests

Tests run inside the container (SQLite in-memory DB, Elasticsearch is mocked):
docker compose exec api php artisan test

Or from the `api/` directory with a local PHP install:
cd api
composer install
php artisan test

Test suites:

- **Unit** — `CustomerService`, `ElasticsearchService` (Guzzle mocked with `MockHandler`)
- **Feature** — Full HTTP integration tests for all CRUD endpoints

---

## Project Structure
fpc-customer-app/
├── docker-compose.yml          # Orchestrates all 5 services
├── .env.example
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf              # Controller / load balancer config
├── api/                        # Laravel application
│   ├── Dockerfile
│   ├── docker-entrypoint.sh    # Runs migrations + ES setup on boot
│   ├── composer.lock           # Locked dependencies for reproducible builds
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   ├── SetupElasticsearchCommand.php
│   │   │   └── ReindexElasticsearchCommand.php  # Bulk reindex from PostgreSQL
│   │   ├── Contracts/
│   │   │   └── ElasticsearchServiceInterface.php   # Interface (DIP)
│   │   ├── Http/
│   │   │   ├── Controllers/CustomerController.php  # Thin controller (SRP)
│   │   │   ├── Requests/                           # Validation (SRP)
│   │   │   └── Resources/CustomerResource.php
│   │   ├── Models/Customer.php
│   │   ├── Providers/AppServiceProvider.php        # DI bindings
│   │   └── Services/
│   │       ├── CustomerService.php                 # Business logic (SRP)
│   │       └── ElasticsearchService.php            # Guzzle HTTP (no Scout)
│   ├── database/
│   │   ├── factories/CustomerFactory.php
│   │   └── migrations/
│   └── tests/
│       ├── Feature/CustomerApiTest.php
│       └── Unit/
│           ├── CustomerServiceTest.php
│           └── ElasticsearchServiceTest.php
└── frontend/                   # React 19 + Vite + Bootstrap
├── Dockerfile
├── index.html
├── vite.config.js
└── src/
├── services/           # Axios HTTP client (calls Laravel API at /api)
├── components/         # CustomerForm, CustomerDetail, DeleteConfirm
├── hooks/              # useCustomers (debounced search + pagination)
└── pages/              # CustomersPage (main view)

---

## SOLID Principles Applied

| Principle                     | Implementation                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **S** – Single Responsibility | `CustomerService` (business logic), `ElasticsearchService` (search sync), `CustomerController` (HTTP layer) are each focused on one concern |
| **O** – Open/Closed           | `ElasticsearchServiceInterface` allows swapping implementations without touching consumers                                                  |
| **L** – Liskov Substitution   | Any class implementing `ElasticsearchServiceInterface` can replace the concrete `ElasticsearchService`                                      |
| **I** – Interface Segregation | The contract exposes only what consumers need (`indexCustomer`, `deleteCustomer`, `search`, `setupIndex`)                                   |
| **D** – Dependency Inversion  | `CustomerService` and `CustomerController` depend on the **interface**, not the concrete class; bindings are in `AppServiceProvider`        |

---

## Useful Commands

```bash
# View live logs
docker compose logs -f api

# Re-run migrations
docker compose exec api php artisan migrate

# Re-create the Elasticsearch index
docker compose exec api php artisan elasticsearch:setup

# Reindex all customers from PostgreSQL into Elasticsearch
docker compose exec api php artisan elasticsearch:reindex

# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

---

## Notes

- **Email uniqueness** is enforced at both the database level (`UNIQUE` constraint) and the API validation layer (`Rule::unique`).
- **Soft deletes** are used — deleted customers are removed from Elasticsearch but retained in the database with a `deleted_at` timestamp.
- **Search** is powered by Elasticsearch `multi_match` with `fuzziness: AUTO`, supporting typo-tolerant search across `first_name`, `last_name`, `full_name`, and `email`.
- The frontend **debounces** search input by 350 ms to avoid excessive API calls.
- If Elasticsearch data is ever wiped, run `php artisan elasticsearch:reindex` to restore all records from PostgreSQL.