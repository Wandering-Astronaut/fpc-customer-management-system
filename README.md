# FPC Customer Management System

A full-stack CRUD application that manages customer records, built for the FPC technical exam.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 11 (PHP 8.3) |
| **Frontend** | React 19 + Vite + Bootstrap 5 |
| **Database** | PostgreSQL 16 |
| **Search** | Elasticsearch 8.13 |
| **Controller / Load Balancer** | Nginx 1.25 |
| **Containerisation** | Docker + Docker Compose |

## Architecture Overview

```
Browser
   │
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
```

> **Note:** Elasticsearch is only accessible within the Docker network. The Laravel API communicates with it using Guzzle — **no Laravel Scout** is used.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x  
- [Docker Compose](https://docs.docker.com/compose/) v2 (bundled with Docker Desktop)  
- [Node.js](https://nodejs.org/) ≥ 20 (for local frontend dev only)

---

## Quick Start

### 1 — Clone the repository

```bash
git clone <your-repo-url>
cd fpc-customer-app
```

### 2 — Configure environment

```bash
cp .env.example .env
cp api/.env.example api/.env
```

Generate an application key (requires PHP locally, **or** skip and let the container do it):

```bash
# Option A – local PHP
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
# Paste the output as APP_KEY= in both .env and api/.env

# Option B – Docker (run after step 3)
docker compose exec api php artisan key:generate
```

### 3 — Build and start all services

```bash
docker compose up --build -d
```

This will:
1. Build the `api` image (PHP-FPM + Composer install)
2. Build the `controller` image (Nginx)
3. Pull `postgres:16-alpine` and `elasticsearch:8.13.4`
4. Run database migrations automatically
5. Create the Elasticsearch `customers` index automatically

> **First boot may take 2–3 minutes** while Elasticsearch initialises.

### 4 — Verify services are running

```bash
docker compose ps
```

All four services should show `Up` / `healthy`.

```bash
# Quick API health check
curl http://localhost/
# → {"service":"FPC Customer API","status":"OK"}
```

### 5 — Launch the frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The Vite dev server proxies all `/api` requests to `http://localhost:80` (Nginx → Laravel).

---

## API Reference

Base URL: `http://localhost/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | List customers (paginated) |
| `GET` | `/customers?search=john` | Search by name or email via Elasticsearch |
| `GET` | `/customers?page=2&per_page=10` | Pagination controls |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers/{id}` | View a customer |
| `PUT` | `/customers/{id}` | Update a customer |
| `DELETE` | `/customers/{id}` | Delete a customer |

### Customer payload

```json
{
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "email": "juan@example.com",
  "contact_number": "+63 917 123 4567"
}
```

---

## Running Tests

Tests run inside the container (SQLite in-memory DB, Elasticsearch is mocked):

```bash
docker compose exec api php artisan test
```

Or from the `api/` directory with a local PHP install:

```bash
cd api
composer install
php artisan test
```

Test suites:
- **Unit** — `CustomerService`, `ElasticsearchService` (Guzzle mocked with `MockHandler`)
- **Feature** — Full HTTP integration tests for all CRUD endpoints

---

## Project Structure

```
fpc-customer-app/
├── docker-compose.yml          # Orchestrates all 4 services
├── .env.example
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf              # Controller / load balancer config
├── api/                        # Laravel application
│   ├── Dockerfile
│   ├── docker-entrypoint.sh    # Runs migrations + ES setup on boot
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── SetupElasticsearchCommand.php
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
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── services/           # Axios HTTP client (calls Laravel API at /api)
        ├── components/         # CustomerForm, CustomerDetail, DeleteConfirm
        ├── hooks/              # useCustomers (debounced search + pagination)
        └── pages/              # CustomersPage (main view)
```

> **Folder naming:** The Laravel backend lives at **`/api`** (repo root). The frontend folder **`frontend/src/services/`** is only the HTTP client that talks to that API — it is not the backend.

---

## SOLID Principles Applied

| Principle | Implementation |
|---|---|
| **S** – Single Responsibility | `CustomerService` (business logic), `ElasticsearchService` (search sync), `CustomerController` (HTTP layer) are each focused on one concern |
| **O** – Open/Closed | `ElasticsearchServiceInterface` allows swapping implementations without touching consumers |
| **L** – Liskov Substitution | Any class implementing `ElasticsearchServiceInterface` can replace the concrete `ElasticsearchService` |
| **I** – Interface Segregation | The contract exposes only what consumers need (`indexCustomer`, `deleteCustomer`, `search`, `setupIndex`) |
| **D** – Dependency Inversion | `CustomerService` and `CustomerController` depend on the **interface**, not the concrete class; bindings are in `AppServiceProvider` |

---

## Useful Commands

```bash
# View live logs
docker compose logs -f api

# Re-run migrations
docker compose exec api php artisan migrate

# Re-create the Elasticsearch index
docker compose exec api php artisan elasticsearch:setup

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
