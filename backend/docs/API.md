# CertifyMe Backend API Documentation — v2.0

## Overview

The CertifyMe Backend API provides AI-powered code verification, blockchain certificate management, plagiarism detection, oracle cryptographic signing, and institutional Campus Mode operations.

**Base URL:** `http://localhost:3001`

---

## Authentication

### Public Endpoints
Most endpoints are publicly accessible (no auth required).

### Campus Mode Endpoints
Campus Mode endpoints require an **API key** passed via the `x-api-key` header:
```
x-api-key: <institution_api_key>
```

---

## Endpoints

### Health Check

#### `GET /health`
Returns server status and feature configuration.

**Response:**
```json
{
  "status": "ok",
  "service": "certifyme-backend",
  "version": "2.0.0",
  "uptime": 73,
  "config": {
    "ai_service": "http://localhost:5001",
    "algorand_network": "testnet",
    "ipfs_configured": false,
    "database": "sqlite (persistent)",
    "oracle_configured": false,
    "contract_deployed": false,
    "app_id": null
  },
  "features": {
    "ai_verification": true,
    "plagiarism_detection": true,
    "oracle_signing": true,
    "campus_mode": true,
    "blockchain_verification": true,
    "ipfs_storage": false
  }
}
```

---

### Certificates

#### `POST /api/certificates/submit-evidence`
Submit a GitHub repository for AI skill verification. This is the main workflow entry point.

**Flow:** Input validation → DB record → AI analysis → Plagiarism check → Oracle signing → IPFS upload → Response

**Request Body:**
```json
{
  "github_url": "https://github.com/user/repo",
  "claimed_skill": "React Development",
  "student_name": "John Doe",
  "description": "Full-stack web app",
  "issuer": "CertifyMe Platform"
}
```

**Response (200):**
```json
{
  "id": "uuid-cert-id",
  "student_name": "John Doe",
  "skill": "React Development",
  "skill_level": "Advanced",
  "ai_score": 78,
  "verified": true,
  "status": "VERIFIED",
  "analysis": {
    "code_quality": 82,
    "complexity": 74,
    "best_practices": 80,
    "originality": 75,
    "strengths": ["Clean architecture"],
    "weaknesses": ["Needs more tests"]
  },
  "evidence_summary": "...",
  "recommendation": "ISSUE_CERTIFICATE",
  "plagiarism_score": 0,
  "oracle_signature": "abc123...",
  "evidence_hash": "sha256...",
  "issue_date": "2026-02-13 18:29:02"
}
```

---

#### `POST /api/certificates/record-mint`
Record on-chain NFT minting details against a certificate.

**Request Body:**
```json
{
  "cert_id": "uuid-cert-id",
  "asset_id": 12345678,
  "tx_id": "ABCDEF..."
}
```

---

#### `GET /api/certificates/verify/:assetId`
Public verification endpoint — employers verify certificates by blockchain asset ID.

**Response:**
```json
{
  "verified": true,
  "certificate": { ... },
  "blockchain_proof": {
    "asset_id": 12345678,
    "on_chain": true,
    "creator": "ALGO...",
    "name": "CM-React Development",
    "url": "ipfs://..."
  },
  "oracle_verified": true,
  "plagiarism_check": {
    "score": 0,
    "is_clean": true
  }
}
```

---

#### `GET /api/certificates/stats`
Get aggregate platform statistics.

**Response:**
```json
{
  "total_certificates": 3,
  "total_verified": 3,
  "total_minted": 1,
  "total_rejected": 0,
  "average_score": 75,
  "top_skills": [
    { "skill": "React Development", "count": 1 }
  ]
}
```

---

#### `GET /api/certificates`
List all certificates. Supports query filtering.

| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| `wallet`  | string | Filter by wallet address        |
| `status`  | string | Filter by status (VERIFIED, MINTED, etc.) |
| `limit`   | number | Max results to return           |

---

#### `GET /api/certificates/:id`
Get a single certificate by UUID cert_id or numeric database ID.

---

#### `POST /api/certificates/revoke`
Revoke a certificate (admin operation).

**Request Body:**
```json
{
  "cert_id": "uuid-cert-id",
  "reason": "Plagiarism detected",
  "admin_wallet": "ALGO..."
}
```

---

### Verification

#### `POST /api/verification/verify-code`
Direct AI code analysis (pass-through to AI service).

**Request Body:**
```json
{
  "github_url": "https://github.com/user/repo",
  "claimed_skill": "Python Backend"
}
```

---

#### `POST /api/verification/verify`
Employer verification — verify a certificate by asset ID with blockchain confirmation.

**Request Body:**
```json
{
  "asset_id": 12345678
}
```

---

#### `GET /api/verification/contract-status`
Get the deployed smart contract status and global state.

---

#### `GET /api/verification/tx/:txId`
Verify a specific transaction exists on Algorand.

---

### Skills

#### `GET /api/skills`
List all available skills for verification.

#### `POST /api/skills`
Register a new skill (admin endpoint).

**Request Body:**
```json
{
  "skill_name": "Rust Development",
  "category": "Systems",
  "min_score": 55,
  "description": "Rust programming language"
}
```

---

### Campus Mode 🏫

All Campus Mode endpoints require the `x-api-key` header (except institution creation).

#### `POST /api/campus/institutions`
Create a new institution. Returns a one-time API key.

**Request Body:**
```json
{
  "name": "MIT",
  "admin_wallet": "ALGO..."
}
```

**Response:**
```json
{
  "institution": { "id": 1, "name": "MIT", "api_key": "..." },
  "message": "⚠️ Save this API key — it will not be shown again",
  "encryption_key": "hex..."
}
```

---

#### `GET /api/campus/institutions`
Get your institution details (authenticated).

---

#### `POST /api/campus/cohorts`
Create a student cohort.

**Request Body:**
```json
{
  "name": "CS 101 - Spring 2026",
  "description": "Introduction to Computer Science",
  "start_date": "2026-01-15",
  "end_date": "2026-05-10"
}
```

---

#### `GET /api/campus/cohorts`
List all cohorts for your institution (with student counts).

---

#### `POST /api/campus/cohorts/:id/students`
Batch enroll students (with AES-256-GCM encrypted PII).

**Request Body:**
```json
{
  "students": [
    { "wallet": "ALGO...", "name": "Alice", "email": "alice@mit.edu", "github": "alice123" },
    { "wallet": "ALGO...", "name": "Bob", "email": "bob@mit.edu", "github": "bob456" }
  ]
}
```

---

#### `GET /api/campus/cohorts/:id/students`
List students in a cohort (decrypted for admins).

---

#### `POST /api/campus/batch-mint`
Start async batch certificate minting job.

**Request Body:**
```json
{
  "student_wallets": ["ALGO...", "ALGO...", "ALGO..."],
  "skill": "React Development",
  "skill_level": "Campus Verified"
}
```

**Response:**
```json
{
  "job_id": 1,
  "status": "queued",
  "message": "Batch minting started for 3 students. Poll /api/campus/jobs/1 for status."
}
```

---

#### `GET /api/campus/jobs/:id`
Check batch job status.

---

#### `GET /api/campus/dashboard`
Institutional dashboard with aggregate stats.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

| Status | Description                    |
|--------|--------------------------------|
| 400    | Bad request / missing fields   |
| 401    | Invalid or missing API key     |
| 403    | Unauthorized access            |
| 404    | Resource not found             |
| 409    | Conflict (duplicate resource)  |
| 500    | Internal server error          |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Express API Server               │
│                    (Node.js, port 3001)              │
├──────────┬──────────┬──────────┬────────────────────┤
│ /api/    │ /api/    │ /api/    │ /api/campus/       │
│ certif.  │ verify   │ skills   │ (auth required)    │
├──────────┴──────────┴──────────┴────────────────────┤
│                    Services Layer                    │
│  ┌────────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ AI Service │ │ Oracle   │ │ Plagiarism       │  │
│  │ (Flask)    │ │ (Ed25519)│ │ (n-gram + hash)  │  │
│  └────────────┘ └──────────┘ └──────────────────┘  │
│  ┌────────────┐ ┌──────────┐                        │
│  │ Algorand   │ │ IPFS     │                        │
│  │ (algosdk)  │ │ (Pinata) │                        │
│  └────────────┘ └──────────┘                        │
├─────────────────────────────────────────────────────┤
│              SQLite Database (persistent)            │
│   submissions | skills | institutions | audit_log   │
└─────────────────────────────────────────────────────┘
```
