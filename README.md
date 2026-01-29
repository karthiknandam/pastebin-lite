<div align="center">
  
# Pastebin-Lite

</div>


<img width="1590" height="988" alt="image" src="https://github.com/user-attachments/assets/a235c6fe-1167-4926-a821-82c7f59dd0d5" />


A lightweight Pastebin-style web application that allows users to create text pastes and share them via a unique URL. Pastes can optionally expire based on time-to-live (TTL) and/or a maximum view count. Once any configured constraint is exceeded, the paste becomes unavailable.

This project was built to satisfy all functional, API, and robustness requirements defined in the take-home assignment and is designed to pass automated grading tests.

---

## Features

- Create a paste with arbitrary text content
- Generate a shareable URL for each paste
- View pastes via API or browser
- Optional constraints:
  - Time-based expiry (TTL)
  - View-count limit
- Deterministic time handling for automated tests
- Persistent storage suitable for serverless environments
- Clean error handling with consistent JSON responses

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Persistence Layer**: Redis (KV-style storage)
- **Type Checks** : Zod , React Hook form
- **Deployment Target**: Vercel (or equivalent serverless platform)

---

## Architecture Overview

- Pastes are stored as JSON objects in Redis with metadata:
  - `content`
  - `created_at`
  - `expires_at` (optional)
  - `remaining_views` (optional)
- TTL is enforced logically (not relying solely on Redis expiry) to support deterministic testing.
- Each successful fetch decrements `remaining_views` atomically.
- All unavailable states (missing, expired, view-exceeded) return HTTP `404`.

---

## API Endpoints

### Health Check

**GET** `/api/healthz`

Returns the application health and verifies access to the persistence layer.

**Response**

```json
{ "ok": true }
```

## Create a Paste

**POST** `/api/pastes`

### Request Body

```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

### Response

```json
{
  "id": "string",
  "url": "https://pastebin-clone.vercel.app/p/<id>"
}
```

### Persistence Layer

Redis is used as the persistence layer to ensure data survives across requests in a serverless environment.

- Reasons for Choosing Redis
- Low latency
- Simple key-value access pattern
- Suitable for ephemeral but persistent data
- Works reliably on Vercel and similar serverless platforms
- No in-memory-only storage is used for paste data.

## Running the Project Locally

### Prerequisites

- Node.js 18 or later
- Redis instance (local or remote)

### Installation

```bash
git clone <repository-url>
cd pastebin-lite
```

### cp .env.example .env

```.env
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```
bun install
bun dev
```
