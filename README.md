# 🏛️ MoTA Unified Scholarship Platform (NTSP)
### Ministry of Tribal Affairs (MoTA) • Government of India

A unified mobile-first single-window scholarship and fellowship portal for Scheduled Tribe (ST) students across India, integrating 5 central schemes into a single glass pane with automated DigiLocker verification, real-time 5-stage DBT pipeline tracking, and JAGO multilingual AI voice assistant.

---

## 🌟 Key Features

1. **5 Unified MoTA Schemes:**
   - **Pre-Matric Scholarship for ST Students** (Classes 9–10)
   - **Post-Matric Scholarship for ST Students** (Classes 11 to PG)
   - **Top Class Education Scheme for ST Students** (IITs, IIMs, AIIMS, NLUs, NITs)
   - **National Fellowship for Higher Education (NFST)** (M.Phil / Ph.D. Scholars)
   - **National Overseas Scholarship (NOS)** (Masters / Ph.D. Abroad)

2. **⚡ 5-Stage Live DBT Disbursement Pipeline:**
   - Real-time tracking from Submission $\to$ DigiLocker/Inst. Verification $\to$ State Sanction $\to$ PFMS Pushed (UTR Ref) $\to$ NPCI Aadhaar-DBT Bank Credit.
   - Proactive NPCI Aadhaar-Seeding Health Check.

3. **📑 1-Click DigiLocker & APAAR Digital Vault:**
   - Instant cryptographic verification of ST/PVTG caste certificates, APAAR/EduLocker ID, and Annual Family Income.

4. **🛡️ Single-Benefit De-Duplication Rule Engine:**
   - Enforces single-benefit compliance across central/state schemes per academic year with seamless academic level progression.

5. **🤖 JAGO Multilingual AI Voice Assistant:**
   - Speech-to-Text (STT) and Text-to-Speech (TTS) voice guide supporting Hindi, English, Odia, Bengali, Santali Ol Chiki, Marathi, and Telugu.

6. **📊 Ministry Outreach & Coverage Gap Analytics:**
   - Ingests UDISE+ and APAAR enrollment records to identify unenrolled ST students in tribal districts (Mayurbhanj, Bastar, Khunti, Dahod, Adilabad) for targeted on-ground mobilization.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** JavaScript (PWA / Mobile-First), Tailwind CSS, GIGW 3.0 Compliance, Web Speech API
* **Backend:** Java Spring Boot Microservice (`backend-java/`) & Node.js/Express API Gateway (`server.js`)
* **Android Native:** Custom Java Views (`WaveformCanvasView.java`, `MeshNodeMapView.java`, `AudioCapturePipeline.java`, `MainActivity.java`)
* **Integrations:** DigiLocker API, APAAR/ABC, NSP, PFMS, Canara Bank SFMP, NOS Standalone, Bhashini AI

---

## 🚀 Getting Started

### 1. Run Web & API Gateway:
```bash
npm install
node server.js
```
Open in browser: `http://localhost:3000`

### 2. Build Android APK:
```powershell
cd android-app
powershell -ExecutionPolicy Bypass -File .\build_apk.ps1
```

---

## 📜 License & Ownership
Content and design aligned with Ministry of Tribal Affairs (MoTA) and Guidelines for Indian Government Websites (GIGW 3.0).
