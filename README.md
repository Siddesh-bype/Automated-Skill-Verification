<div align="center">

# 🛡️ CertifyMe — Automated Skill Verification on Algorand

### _AI-Powered Code Analysis · Blockchain-Issued Certificates · Instant Employer Verification_

[![Algorand](https://img.shields.io/badge/Built%20on-Algorand-black?logo=algorand&logoColor=white)](https://www.algorand.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/AI%20Service-Flask-000000?logo=flask)](https://flask.palletsprojects.com/)
[![OpenRouter](https://img.shields.io/badge/LLM-OpenRouter-6366F1)](https://openrouter.ai/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br/>

> **CertifyMe** solves the trust gap in skill verification. Students submit a GitHub repository, our AI engine analyzes the code across four dimensions, and if the quality meets the threshold, a tamper-proof NFT certificate is minted on the Algorand blockchain. Employers can verify any certificate in seconds — no phone calls to universities, no trust issues.

</div>

---

## 📑 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Files for Judges to Review](#-files-for-judges-to-review)
- [Getting Started](#-getting-started)
- [Demo Walkthrough](#-demo-walkthrough)
- [Smart Contract Design](#-smart-contract-design)
- [AI Verification Engine](#-ai-verification-engine)
- [API Documentation](#-api-documentation)
- [Feature Completion Status](#-feature-completion-status)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)

---

## 🔴 Problem Statement

Traditional skill verification is **broken**:

| Problem | Impact |
|---|---|
| Certificates are **easily forged** | Employers can't trust what they see on a résumé |
| Verification is **manual and slow** | HR teams spend weeks calling universities and past employers |
| Credentials are **not portable** | Locked inside institutional databases across borders |
| Skills are **self-reported** | No objective, code-level proof of ability |

> _"67% of employers have caught a lie on a candidate's resume."_ — HireRight Report

---

## 💡 Our Solution

**CertifyMe** is an end-to-end decentralized skill verification platform that:

1. **Analyzes code with AI** — Students submit a GitHub repo; our AI engine (powered by OpenRouter LLM) performs a 4-dimensional analysis: Code Quality, Complexity, Best Practices, and Originality.

2. **Issues blockchain certificates** — If the AI score meets the threshold (≥45/100), an ARC-19 compliant NFT is minted on the Algorand blockchain with full metadata stored on IPFS.

3. **Enables instant verification** — Employers enter a certificate's Asset ID and get instant proof: the skill, the score, the code evidence, and the blockchain transaction — all verified on-chain.

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌────────────────┐
│   Student    │────▶│  AI Engine   │────▶│  IPFS Upload  │────▶│  Algorand Mint │
│ (GitHub URL) │     │ (4D Analysis)│     │  (Metadata)   │     │  (NFT Cert)    │
└─────────────┘     └──────────────┘     └───────────────┘     └────────────────┘
                                                                       │
                    ┌──────────────┐                                    │
                    │   Employer   │◀───────── Verify by Asset ID ──────┘
                    │  (Instant)   │
                    └──────────────┘
```

---

## ✨ Key Features

### For Students
- 📝 **Submit Evidence** — Paste any public GitHub repository URL
- 🤖 **AI Code Analysis** — 4-dimensional scoring: Quality, Complexity, Practices, Originality
- 📊 **Detailed Feedback** — Strengths, weaknesses, and evidence summary from the AI
- ⛓️ **Mint NFT Certificate** — One-click minting on Algorand TestNet via Pera/Defly wallet
- 🎓 **Certificate Dashboard** — View all earned certificates with scores, statuses, and blockchain links
- 🌐 **Multi-Chain Selection** — Choose between Algorand (real), Ethereum, or Polygon (simulated) when submitting
- 📁 **Portfolio Builder** — Create a shareable profile showcasing all earned certificates
- 📤 **Certificate Sharing** — Share via WhatsApp, Email, or time-limited tokenized links

### For Employers
- 🔍 **Instant Verification** — Enter an Asset ID, get full certificate proof in seconds
- � **Batch Verification** — Verify up to 50 certificates at once with summary stats
- 🚨 **Revocation Feed** — Real-time alerts when certificates are revoked (auto-refresh)
- �📂 **Code Evidence** — Direct link to the analyzed GitHub repository
- ⛓️ **Blockchain Proof** — On-chain verification via Algorand Explorer
- 📈 **AI Score Breakdown** — See exactly how the candidate scored across all dimensions

### Platform
- 🌐 **Modern UI** — Dark theme design system with custom color palette (#222831, #00ADB5)
- 🔐 **Multi-Wallet Support** — Pera, Defly, Exodus, and Lute wallets supported
- 🏗️ **ARC-19 Compliant** — NFT certificates follow the Algorand ARC-19 standard
- 📌 **IPFS Metadata** — Certificate metadata is permanently stored on IPFS via Pinata
- 🐳 **Docker Ready** — Full Docker Compose setup for one-command deployment
- 🛡️ **Anti-Gaming** — Repo age check (>10 min) and commit count validation (>3 commits)
- 💾 **SQLite Database** — Persistent storage with Docker volumes for all certificate data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                     │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Home   │  │SubmitEvidence│  │  Dashboard │  │EmployerView  │  │
│  │  Landing │  │    Modal     │  │   Modal    │  │    Modal     │  │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └──────┬───────┘  │
│       │               │               │                │           │
│  ┌────▼───────────────▼───────────────▼────────────────▼────────┐  │
│  │              Services (verification.ts, nft.ts)               │  │
│  │        ┌─────────────────┐    ┌──────────────────────┐        │  │
│  │        │ Algorand SDK    │    │  Pinata IPFS Client   │        │  │
│  │        │ (Wallet + Mint) │    │  (Metadata Upload)    │        │  │
│  │        └─────────────────┘    └──────────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────────┐
│                     BACKEND (Express.js)                            │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │  /certificates  │  │  /verification │  │     /skills         │  │
│  │  submit-evidence│  │  verify-code   │  │  list available     │  │
│  │  record-mint    │  │  (proxy to AI) │  │  skills + criteria  │  │
│  │  get / list     │  └───────┬────────┘  └─────────────────────┘  │
│  │  verify/:assetId│          │                                     │
│  └─────────────────┘          │                                     │
│                               │                                     │
│  ┌─────────────────┐  ┌──────▼─────────┐  ┌─────────────────────┐  │
│  │ IPFS Service    │  │ AI Service     │  │ Algorand Service    │  │
│  │ (Pinata upload) │  │ (proxy client) │  │ (asset/tx lookup)   │  │
│  └─────────────────┘  └───────┬────────┘  └─────────────────────┘  │
└────────────────────────────────┼────────────────────────────────────┘
                                │ HTTP
┌────────────────────────────────▼────────────────────────────────────┐
│                    AI SERVICE (Flask + Python)                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  code_verifier.py                                           │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────────┐  │    │
│  │  │ GitHub Fetcher  │  │  OpenRouter LLM Analysis         │  │    │
│  │  │ (repo tree +    │  │  Model: openai/gpt-oss-120b:free │  │    │
│  │  │  raw file fetch)│  │  4D Scoring + Recommendations    │  │    │
│  │  └─────────────────┘  └──────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌────────────────────────────────▼────────────────────────────────────┐
│                      ALGORAND BLOCKCHAIN                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Smart Contract: CertifyMe (ARC4)                            │   │
│  │  • mint_certificate()    • get_certificate()                 │   │
│  │  • verify_certificate()  • revoke_certificate()              │   │
│  │  • register_skill()      • get_skill_threshold()             │   │
│  │  • Box Storage: cert_ prefix (CertificateData struct)        │   │
│  │  • Global State: certificate_count, admin, min_ai_score      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ASA NFTs: ARC-19 Certificate Tokens                         │   │
│  │  • Unit: CERTME  • Decimals: 0  • Total: 1 (per cert)       │   │
│  │  • URL: ipfs://<CID>#arc3  • MetadataHash: SHA-256           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | SPA with hot-reload |
| **Styling** | TailwindCSS + DaisyUI | Dark theme, responsive components |
| **Wallet** | `@txnlab/use-wallet-react` | Pera, Defly, Exodus, Lute support |
| **Backend** | Express.js (Node.js) + SQLite | REST API, certificate orchestration, persistent DB |
| **Database** | better-sqlite3 | Persistent storage with schema migrations |
| **AI Engine** | Flask (Python) + OpenRouter | Code analysis via `openai/gpt-oss-120b:free` |
| **Blockchain** | Algorand TestNet + AlgoPy | ARC-4 smart contract, ARC-19 NFTs |
| **Multi-Chain** | Algorand (real) + Ethereum/Polygon (simulated) | Chain-agnostic certificate metadata |
| **Storage** | IPFS via Pinata | Permanent certificate metadata |
| **SDK** | `algosdk` + `@algorandfoundation/algokit-utils` | On-chain interactions |
| **DevOps** | Docker + Docker Compose | Containerized deployment with persistent volumes |

---

## 📂 Project Structure

```
CertifyMe/
├── 📁 projects/
│   ├── 📁 frontend/                    # React Frontend Application
│   │   ├── src/
│   │   │   ├── Home.tsx                # ⭐ Main landing page (hero, nav, CTAs)
│   │   │   ├── App.tsx                 # Wallet provider setup
│   │   │   ├── main.tsx                # React entry point
│   │   │   ├── 📁 components/
│   │   │   │   ├── SubmitEvidence.tsx   # ⭐ Evidence submission + AI verification flow
│   │   │   │   ├── StudentDashboard.tsx # ⭐ Certificate grid with stats
│   │   │   │   ├── CertificateCard.tsx  # Individual certificate display
│   │   │   │   ├── VerifyCredential.tsx # Public certificate verification
│   │   │   │   ├── EmployerView.tsx     # ⭐ Employer verification portal
│   │   │   │   ├── ConnectWallet.tsx    # Multi-wallet connection modal
│   │   │   │   ├── AnimatedBackground.tsx # Particle grid + radial glow background
│   │   │   │   ├── FloatingIcon.tsx     # Framer Motion floating animation wrapper
│   │   │   │   ├── AnimatedCounter.tsx  # Count-up stats on scroll
│   │   │   │   ├── GlassCard.tsx        # Glassmorphism card component
│   │   │   │   ├── LottieAnimation.tsx  # Lottie JSON animation wrapper
│   │   │   │   └── ErrorBoundary.tsx    # Error boundary wrapper
│   │   │   ├── 📁 services/
│   │   │   │   ├── verification.ts     # ⭐ Backend API client (submit, fetch, verify)
│   │   │   │   ├── nft.ts              # ⭐ ARC-19 NFT minting logic
│   │   │   │   └── algorand.ts         # Algod/Indexer client helpers
│   │   │   ├── 📁 utils/
│   │   │   │   └── pinata.ts           # Pinata IPFS upload helpers
│   │   │   └── 📁 styles/
│   │   │       └── main.css            # Design system (brand, surface, components)
│   │   ├── tailwind.config.cjs         # Custom theme + DaisyUI config
│   │   ├── index.html                  # Entry HTML with certifyme theme
│   │   └── .env                        # Frontend env vars
│   │
│   └── 📁 contracts/
│       └── smart_contracts/
│           └── certifyme/
│               └── contract.py         # ⭐ ARC-4 smart contract (mint, verify, revoke)
│
├── 📁 backend/                         # Express.js Backend API
│   ├── server.js                       # Express server setup + middleware
│   ├── Dockerfile                      # Docker build for backend
│   ├── 📁 db/
│   │   ├── connection.js               # SQLite database connection
│   │   └── schema.js                   # ⭐ Full schema with migrations + seed data
│   ├── 📁 routes/
│   │   ├── certificates.js             # ⭐ /submit-evidence, /record-mint, /verify, /revoke
│   │   ├── verification.js             # AI proxy + /batch + /chains endpoints
│   │   ├── portfolio.js                # Portfolio CRUD + public sharing
│   │   ├── sharing.js                  # Tokenized share links with expiry
│   │   └── skills.js                   # Skill registry endpoint
│   ├── 📁 services/
│   │   ├── ai.js                       # ⭐ AI service client (with mock fallback)
│   │   ├── multichain.js               # Multi-chain config (Algorand, Ethereum, Polygon)
│   │   ├── ipfs.js                     # Pinata IPFS integration
│   │   └── algorand.js                 # On-chain verification helpers
│   └── .env                            # Backend env vars
│
├── 📁 ai-services/                     # Flask AI Microservice
│   ├── app.py                          # Flask server (/verify-code, /skills)
│   ├── code_verifier.py                # ⭐ GitHub fetcher + OpenRouter LLM + anti-gaming
│   ├── Dockerfile                      # Docker build for AI service
│   └── .env                            # OpenRouter API key
│
├── docker-compose.yml                  # ⭐ Full stack Docker orchestration
│
└── README.md                           # ← You are here
```

> **⭐ = Key files for judges to review**

---

## 🔎 Files for Judges to Review

We recommend reviewing these files to understand the full depth of our implementation:

### 1. AI Verification Engine
📄 **`ai-services/code_verifier.py`**
- Fetches source files from any public GitHub repo via the GitHub API
- Sends code to OpenRouter LLM (`openai/gpt-oss-120b:free`) with a structured analysis prompt
- Returns a 4-dimensional score (Quality, Complexity, Practices, Originality) with weighted average
- Includes deterministic mock fallback for offline demo capability
- Handles edge cases: private repos, empty repos, rate limits, malformed responses

### 2. Smart Contract
📄 **`projects/contracts/smart_contracts/certifyme/contract.py`**
- ARC-4 compliant Algorand smart contract written in AlgoPy
- Uses **Box Storage** (`BoxMap`) for scalable certificate data (no global state limits)
- `CertificateData` struct: recipient, skill, score, evidence hash, issuer, timestamp, revocation status
- Methods: `mint_certificate`, `get_certificate`, `verify_certificate`, `revoke_certificate`
- Skill registry with per-skill minimum score thresholds
- Admin controls: `transfer_admin`, `update_min_score`

### 3. NFT Minting Service
📄 **`projects/frontend/src/services/nft.ts`**
- Creates ARC-19 compliant ASA (Algorand Standard Asset) NFTs
- Uploads metadata to IPFS via Pinata before minting
- Computes SHA-256 metadata hash for on-chain integrity verification
- Uses `@algorandfoundation/algokit-utils` for clean transaction building

### 4. Certificate Orchestration
📄 **`backend/routes/certificates.js`**
- Full lifecycle: submit → AI verify → IPFS upload → store → mint → verify → revoke
- In-memory certificate store (suitable for hackathon; production would use a database)
- Public verification endpoint for employers (`/verify/:assetId`)

### 5. Multi-Chain & Portfolio
📄 **`backend/services/multichain.js`** — Chain metadata for Algorand (real), Ethereum & Polygon (simulated)
📄 **`backend/routes/portfolio.js`** — Student portfolio CRUD with public shareable profiles
📄 **`backend/routes/sharing.js`** — Tokenized certificate share links with configurable expiry (1h–30d)
📄 **`backend/db/schema.js`** — Full SQLite schema with 8 tables, indexes, safe migrations, and seed data

### 6. Frontend Flow
📄 **`projects/frontend/src/components/SubmitEvidence.tsx`**
- Multi-step UX: Form → AI Verifying (animated) → Result (4D scores) → Mint NFT
- Integrated wallet interaction with transaction signing
- Real-time progress feedback with animated badges

📄 **`projects/frontend/src/components/EmployerView.tsx`**
- Employer-facing verification portal
- Score rating system (Exceptional → Insufficient)
- Blockchain proof display with explorer links

---

## 🚀 Getting Started

### Prerequisites

- **Docker** + **Docker Compose** (recommended) — OR:
- **Node.js** ≥ 18, **Python** ≥ 3.10, **npm** ≥ 9
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier works)
- An Algorand TestNet wallet (Pera Wallet recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Siddesh-bype/Automated-Skill-Verification.git
cd Automated-Skill-Verification
```

### 2. Run with Docker (Recommended)

```bash
# Start all services in one command
docker-compose up --build

# Services:
#   Frontend → http://localhost:5173
#   Backend  → http://localhost:3001
#   AI       → http://localhost:5001
```

The SQLite database is persisted via a Docker volume (`backend-data`), so data survives container restarts.

### 3. Run in Hybrid Mode (Recommended for Connectivity)

If you encounter GitHub API timeouts in Docker, use this mode:

**Terminal 1 (Backend & DB in Docker):**
```bash
docker-compose up --build backend
```

**Terminal 2 (AI Service Locally):**
```bash
cd ai-services
pip install -r requirements.txt
python app.py
```

**Terminal 3 (Frontend Locally):**
```bash
cd projects/frontend
npm run dev
```

### 4. Run Locally (Alternative)

<details>
<summary>Click to expand manual setup</summary>

#### Setup Frontend

```bash
cd projects/frontend
npm install
cp .env.template .env
npm run dev
```

#### Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

#### Setup AI Service

```bash
cd ai-services
pip install -r requirements.txt
cp .env.example .env
python app.py
```

</details>

### 5. Open the App

Navigate to **http://localhost:5173/** in your browser.

---

## 🎬 Demo Walkthrough

### Step 1: Connect Wallet
Click **"Connect Wallet"** → Select **Pera Wallet** → Approve connection.

### Step 2: Submit Evidence
Click **"Submit Evidence"** → Fill in:
- **Name**: Your name
- **Skill**: Select from dropdown (e.g., "React Development")
- **GitHub URL**: Any public repo (e.g., `https://github.com/facebook/react`)
- Click **"🔍 Verify with AI"**

### Step 3: View AI Results
The AI engine analyzes the code and returns:
- **Overall Score** (0-100) with skill level (Beginner → Expert)
- **4D Breakdown**: Code Quality, Complexity, Best Practices, Originality
- **Strengths & Weaknesses** with evidence summary
- **Recommendation**: ISSUE_CERTIFICATE or REJECT

### Step 4: Mint Certificate
If verified (score ≥ 45), click **"⛓️ Mint Certificate NFT"**:
- Metadata is uploaded to IPFS
- ARC-19 NFT is created on Algorand TestNet
- Transaction is confirmed in your wallet

### Step 5: View Dashboard
Click **"My Certificates"** to see all your earned certificates:
- Scores, statuses (Verified / Minted / Rejected)
- Blockchain explorer links
- Shareable verification links

### Step 6: Employer Verification
Click **"Verify a Candidate"** → Enter Asset ID → See:
- ✅/❌ Verification status
- Full certificate details + AI analysis
- Blockchain proof with explorer link

---

## 📜 Smart Contract Design

### Contract: `CertifyMe` (ARC-4)

```python
class CertificateData(Struct):
    recipient: ARC4String       # Wallet address
    skill: ARC4String           # e.g., "React Development"
    skill_level: ARC4String     # Expert / Advanced / Intermediate / Beginner
    ai_score: ARC4UInt64        # 0-100
    evidence_hash: ARC4String   # IPFS CID of analysis
    issuer: ARC4String          # "CertifyMe Platform"
    issue_date: ARC4String      # ISO 8601
    metadata_url: ARC4String    # ipfs://<CID>#arc3
    is_revoked: ARC4Bool        # Fraud protection
```

### Methods

| Method | Access | Description |
|---|---|---|
| `mint_certificate()` | Admin | Issue new certificate, returns cert_id |
| `get_certificate(id)` | Public | Retrieve certificate data from box storage |
| `verify_certificate(id)` | Public | Check existence + non-revocation status |
| `revoke_certificate(id)` | Admin | Revoke a fraudulent certificate |
| `register_skill(name, min_score)` | Admin | Add skill to registry |
| `get_skill_threshold(name)` | Public | Get minimum score for a skill |
| `update_min_score(new_min)` | Admin | Update global minimum threshold |
| `transfer_admin(new_admin)` | Admin | Transfer admin role |

### Storage Strategy

- **Global State**: `certificate_count`, `admin`, `min_ai_score`
- **Box Storage**: `cert_<id>` → `CertificateData` (scalable, no 64-value limit)
- **Skill Registry**: `skill_<name>` → minimum score threshold

---

## 🤖 AI Verification Engine

### How It Works

1. **GitHub Fetcher** (`fetch_github_repo_files`)
   - Extracts `owner/repo` from URL
   - Fetches repo tree via GitHub API (tries `main`, falls back to `master`)
   - Filters for source code files (`.py`, `.js`, `.tsx`, `.java`, `.go`, etc.)
   - Excludes `node_modules`, `dist`, minified files
   - Downloads first 10 files (truncated to 3000 chars each)

2. **LLM Analysis** (`verify_code`)
   - Sends structured prompt to `openai/gpt-oss-120b:free` via OpenRouter
   - Requests JSON response with exact scoring keys
   - Parses 4D scores + weighted average (Quality 30%, Complexity 25%, Practices 25%, Originality 20%)
   - Handles markdown code blocks, malformed JSON, timeouts

3. **Skill Level Mapping**
   ```
   ≥90 → Expert
   ≥75 → Advanced  
   ≥60 → Intermediate
   ≥45 → Beginner (still certified)
   <45 → FAIL (rejected)
   ```

### Demo Mode
When no API key is configured, the system generates **deterministic mock analysis** based on a hash of the GitHub URL. This ensures the full demo flow works without any external dependencies.

---

## 📡 API Documentation

### Backend (Express.js — Port 3001)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check with feature list |
| `GET` | `/api/skills` | List available skills + criteria |
| `POST` | `/api/certificates/submit-evidence` | Submit GitHub URL for AI verification |
| `POST` | `/api/certificates/record-mint` | Record on-chain mint (asset_id, tx_id) |
| `GET` | `/api/certificates` | List all certificates (dashboard) |
| `GET` | `/api/certificates/:id` | Get certificate by ID |
| `GET` | `/api/certificates/verify/:assetId` | Public verification by Asset ID |
| `POST` | `/api/certificates/revoke/:certId` | Revoke a certificate (logs to feed) |
| `GET` | `/api/certificates/revocations` | Get revocation event feed |
| `POST` | `/api/verification/verify-code` | Proxy to AI service |
| `POST` | `/api/verification/batch` | Batch verify up to 50 certificates |
| `GET` | `/api/verification/chains` | List supported blockchains |
| `GET` | `/api/portfolio/:wallet` | Get/create student portfolio |
| `POST` | `/api/portfolio` | Create or update portfolio |
| `GET` | `/api/portfolio/public/:shareToken` | Public portfolio view |
| `POST` | `/api/share` | Create tokenized share link |
| `GET` | `/api/share/:token` | Access shared certificate |
| `GET` | `/api/share/:token/verify` | Verify shared certificate on-chain |

### AI Service (Flask — Port 5001)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/verify-code` | Analyze GitHub repo with LLM |
| `GET` | `/api/skills` | Available skills list |

### Example: Submit Evidence

```bash
curl -X POST http://localhost:3001/api/certificates/submit-evidence \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/facebook/react",
    "claimed_skill": "React Development",
    "student_name": "Jane Doe",
    "chain_name": "algorand"
  }'
```

**Response:**
```json
{
  "id": "a1b2c3d4-...",
  "verified": true,
  "ai_score": 82,
  "skill_level": "Advanced",
  "skill": "React Development",
  "chain_name": "algorand",
  "analysis": {
    "code_quality": 88,
    "complexity": 79,
    "best_practices": 85,
    "originality": 72,
    "strengths": ["Clean architecture", "Comprehensive testing"],
    "weaknesses": ["Complex build system"]
  },
  "recommendation": "ISSUE_CERTIFICATE",
  "evidence_summary": "Production-grade UI library demonstrating advanced React patterns...",
  "status": "VERIFIED"
}
```

---

## ✅ Feature Completion Status

| Feature | Status | Details |
|---|---|---|
| Landing Page UI | ✅ Complete | Dark theme with custom palette (#222831, #00ADB5) |
| Wallet Connection | ✅ Complete | Pera, Defly, Exodus, Lute via `@txnlab/use-wallet-react` |
| Submit Evidence Modal | ✅ Complete | Multi-step form with chain selector |
| AI Code Analysis | ✅ Complete | OpenRouter LLM with 4D scoring + mock fallback |
| GitHub Repo Fetcher | ✅ Complete | Handles main/master branches, `.git` suffix, file filtering |
| Anti-Gaming Checks | ✅ Complete | Repo age (>10 min) and commit count (>3) validation |
| Certificate Dashboard | ✅ Complete | Grid view, filters, stats, refresh |
| Certificate Cards | ✅ Complete | Score badges, chain badges, share button, analysis bars |
| NFT Minting (ARC-19) | ✅ Complete | IPFS upload + ASA creation + metadata hash |
| Record Mint Backend | ✅ Complete | Updates certificate with asset_id and tx_id |
| Employer Verification | ✅ Complete | Tabbed portal: Single, Batch, Revocation Feed |
| Batch Verification | ✅ Complete | Verify up to 50 certificates at once with summary |
| Revocation Feed | ✅ Complete | Real-time auto-refresh (30s polling) with chain info |
| Multi-Chain Support | ✅ Complete | Algorand (real), Ethereum & Polygon (simulated) |
| Portfolio Builder | ✅ Complete | Editable profile, certificate grid, public sharing |
| Certificate Sharing | ✅ Complete | WhatsApp, Email, tokenized links with 1h–30d expiry |
| Public Verify Endpoint | ✅ Complete | `/verify/:assetId` with blockchain cross-check |
| Smart Contract (ARC-4) | ✅ Complete | Mint, verify, revoke + box storage + skill registry |
| SQLite Database | ✅ Complete | 8 tables, indexes, safe migrations, seed data |
| Docker Deployment | ✅ Complete | Docker Compose with persistent volumes |
| Backend API | ✅ Complete | 18+ endpoints across 5 route modules |
| AI Service | ✅ Complete | Flask + OpenRouter with graceful fallbacks |
| IPFS Integration | ✅ Complete | Pinata upload for certificate metadata |
| Error Handling | ✅ Complete | Null safety, error boundaries, toast notifications |
| Environment Config | ✅ Complete | `.env.example` files for all services |
| Responsive Design | ✅ Complete | Mobile-first with md/lg breakpoints |

---

## 🔮 Future Roadmap

- **Real Multi-chain Deployment** — Deploy smart contracts on Ethereum & Polygon (currently simulated)
- **Institution Accounts** — Universities can issue certificates through CertifyMe
- **Advanced AI Models** — Fine-tuned code analysis models for specific skills
- **Mobile App** — React Native app for wallet-native certificate management
- **CI/CD Pipeline** — Automated testing and deployment with GitHub Actions

---

## 👥 Team

| Member | Role |
|---|---|
| **Siddesh Bype** | Full Stack Developer & Project Lead |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Hackathon**

_CertifyMe — Where AI meets Blockchain to verify real skills._

[📂 GitHub](https://github.com/Siddesh-bype/Automated-Skill-Verification)

</div>

