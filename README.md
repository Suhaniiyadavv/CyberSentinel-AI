# CyberSentinel AI: Cyber Incident Detection & Automated Response Recommendation Platform

[![SOC Platform](https://img.shields.io/badge/SOC-CyberSentinel%20AI-06b6d4)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-cyan)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple)](https://vitejs.dev/)

An end-to-end, production-grade **Security Operations Center (SOC) platform** demonstrating how Machine Learning (Isolation Forest anomaly detection + Random Forest classification) complements traditional deterministic rule monitoring (Sigma rules) for cyber incident detection, IoC extraction, MITRE ATT&CK mapping, and automated response recommendations.

---

## 1. Executive Summary

Traditional security monitoring relies heavily on signature and threshold rules (e.g., failed logins $> 5$, known hostile IP lists). While deterministic and fast, static rules fail against zero-day variances, low-and-slow brute force, and multi-vector anomalies.

**CyberSentinel AI** bridges this gap through a unified detection pipeline:
1. **Unsupervised Anomaly Detection:** An internal **Isolation Forest** computes tree isolation path lengths $s(x, n) = 2^{-\mathbb{E}(h(x))/c(n)}$ to flag statistical outliers without labeled signatures.
2. **Supervised Classification:** An ensemble **Random Forest Classifier** maps feature vectors into specific incident classes with multi-class probability confidence.
3. **Deterministic Corroboration:** A **Sigma Rule Engine** runs concurrent signature matching.
4. **Decision Fusion:** Synthesizes AI and rule outputs into a calibrated **AI Risk Score (0–100)** and tags detection source as `AI`, `RULE`, or `AI + RULE`.
5. **Mitigation:** Automatically extracts **IoCs**, maps to **MITRE ATT&CK**, calculates evidence-based **Severity**, and recommends actionable containment playbooks.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CYBERSENTINEL AI ARCHITECTURE                   │
└────────────────────────────────────────────────────────────────────────┘

    Incoming Security Event Stream / CSV Dataset (CIC-IDS2017 & NSL-KDD)
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │       PREPROCESSING & FEATURE EXTRACTION     │
        │ - StandardScaler (leakage-free scaling)     │
        │ - Derived: PPS, BPS, SYN/ACK, Port Risk, Rep │
        └──────────────────────┬───────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   ┌─────────────────────────┐   ┌─────────────────────────┐
   │    ISOLATION FOREST     │   │      RANDOM FOREST      │
   │   (Anomaly Detection)   │   │     (Classification)    │
   │  Path Length Scoring    │   │   Gini Impurity Splits  │
   │ s(x,n) = 2^(-E(h)/c(n)) │   │  Multi-class Confidence │
   └────────────┬────────────┘   └────────────┬────────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │            SIGMA RULE ENGINE (v2.0)          │
        │ - Brute Force Thresholds (SIGMA-001)         │
        │ - Port Scan Discovery (SIGMA-002)            │
        │ - Exploit Listener Ports (SIGMA-003)         │
        │ - Volumetric Packet Flood (SIGMA-004)        │
        │ - Threat Intel Blocklists (SIGMA-005)        │
        │ - Web Injections SQLi/XSS (SIGMA-006)        │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        DECISION FUSION & ENSEMBLE ENGINE     │
        │ Source: AI | RULE | AI + RULE                │
        │ Zero-Day / Potential Unknown Detection Tag   │
        └──────────────────────┬───────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  IOC ENGINE  │       │ MITRE ATT&CK │       │   SEVERITY   │
│ - IPv4       │       │ - T1110      │       │ - CRITICAL   │
│ - Domains    │       │ - T1046      │       │ - HIGH       │
│ - Hashes     │       │ - T1498      │       │ - MEDIUM     │
│ - Ports      │       │ - T1190, ... │       │ - LOW        │
└───────┬──────┘       └───────┬──────┘       └───────┬──────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │   AUTOMATED RESPONSE RECOMMENDATION ENGINE   │
        │ - Containment playbooks & shell scripts      │
        │ - Analyst confirmation workflow (Pending/App) │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │   REACT SOC COMMAND CENTER & REST API (3000) │
        └──────────────────────────────────────────────┘
```

---

## 3. Demo Credentials

For live viva evaluation, a pre-seeded SOC analyst account is ready:

- **Email:** `demo@cybersentinel.ai`
- **Password:** `Demo@123`

*(You can also click the **"Use Demo Account"** button on the login screen).*

---

## 4. Viva Demonstration Flow (5-Minute Walkthrough)

1. **Authentication:**
   - Launch application on `http://localhost:3000`.
   - Log in using `demo@cybersentinel.ai` / `Demo@123`.
2. **SOC Command Center:**
   - View the 8 primary KPI cards and the dynamic **Security Posture Score (78/100, HIGH RISK)**.
   - Point out the evidence-based deductions: unresolved critical incidents, threat indicators, and uncontained alerts.
3. **Live Demonstration Execution:**
   - Click the **"START LIVE DEMO"** button in the Viva controller bar.
   - Select **Scenario: Brute Force** (or Port Scan / DoS / Infiltration).
   - Watch the 8-stage visual pipeline trace:
     - Ingestion $\to$ Feature Extraction $\to$ Isolation Forest Anomaly $\to$ Random Forest Classification $\to$ Sigma Rule $\to$ IoC Extraction $\to$ MITRE Mapping $\to$ Response Generated.
4. **Investigation Timeline:**
   - Navigate to **Incidents & Cases**.
   - Open the generated incident (e.g. `INC-1042`).
   - Show the **Chronological Incident Timeline** with individual timestamps and root-cause evidence.
   - Show the **Severity Calculation Evidence** detailing why it became `CRITICAL`.
5. **AI vs Rule-Based Comparison:**
   - Navigate to **AI vs Rule Comparison**.
   - Show the calculated comparison table: Accuracy, Precision, Recall, F1, FPR, FNR, and zero-day visibility.
6. **ML Performance:**
   - Navigate to **ML Performance Metrics**.
   - Show the multi-class Confusion Matrix and **Feature Importance** rankings (e.g. `failed_login_count`, `connection_frequency`, `port_risk_score`).
7. **Response Center:**
   - Navigate to **Response Center**.
   - Review containment scripts and click **"Approve"** on the firewall drop rule.

---

## 5. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Express & Node.js 22 runtime serving full REST endpoints
- **Python Codebase:** FastAPI, Pydantic, NumPy, Pandas, Scikit-learn scripts included in `backend/` and `scripts/`
- **Machine Learning Algorithms:**
  - *Unsupervised:* Isolation Forest with recursive binary isolation trees and path-length scoring
  - *Supervised:* Random Forest Classifier with bootstrap bagging, Gini impurity splitting, and MDI feature importance
- **Detection Standards:** Sigma Rules Specification v2.0, MITRE ATT&CK Matrix v14.1

---

## 6. Local Installation & Startup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Complete Full-Stack Application
```bash
npm run dev
```

The application starts on `http://localhost:3000` with the complete REST API mounted at `/api/*` and the interactive React SOC dashboard.

---

## 7. Python Verification & Testing

Unit tests for the ML pipeline formulas and detection engines can be verified via:

```bash
python3 tests/test_pipeline.py
```

Result:
```
Ran 5 tests in 0.001s
OK
```

---

## 8. Implemented Features Checklist

- [x] Secure Cybersecurity Login Page with authenticated backend & demo credentials
- [x] Dynamic Security Posture Score (0–100) calculated from actual threat factors
- [x] Real-time Live Event Monitor with play/pause, search, and deep flow drawer
- [x] Full CSV Dataset Upload & Ingestion Pipeline with structural preview
- [x] Realistic CIC-IDS2017 & NSL-KDD dataset bundled (`data/sample_security_events.csv`)
- [x] Isolation Forest Anomaly Detection Engine with BST path length calculation
- [x] Random Forest Supervised Multi-class Classification Engine with Gini splits
- [x] Deterministic Sigma Rule Engine with active rule toggling & YAML inspector
- [x] AI + Rule Decision Fusion Engine with "Potential Unknown / Zero-Day" isolation
- [x] Indicators of Compromise (IoC) Extractor (IPv4, Domains, Hashes MD5/SHA256, Ports)
- [x] MITRE ATT&CK Matrix Visual Mapping & Technique Dossiers
- [x] Exploratory Data Analysis (EDA) Interactive Charts (Recharts)
- [x] Chronological Incident Investigation Timeline
- [x] Automated Response Recommendation Engine with script preview & approval workflow
- [x] AI vs Rule-Based Side-by-Side Benchmarking (Accuracy, Precision, Recall, F1, FPR, FNR)
- [x] Model Performance Page with Confusion Matrix & Feature Importance Ranking
- [x] Local Model Lifecycle Management & Version Registry (Retrain pipeline)
- [x] SOC Immutable Audit Trail Logging

---

*CyberSentinel AI — Designed and engineered for academic viva presentation, technical recruitment defense, and enterprise SOC workflow demonstration.*
