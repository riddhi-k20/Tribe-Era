const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Simulation in Memory
const SCHEMES = [
  { id: 'PRE_MATRIC', name: 'Pre-Matric Scholarship for ST Students', grades: 'Classes 9 & 10', amount: '₹3,500 - ₹7,000 / yr', legacyPortal: 'NSP Portal' },
  { id: 'POST_MATRIC', name: 'Post-Matric Scholarship for ST Students', grades: 'Class 11 to Post-Graduation', amount: '₹12,000 - ₹48,000 / yr', legacyPortal: 'NSP Portal' },
  { id: 'TOP_CLASS', name: 'Top Class Education Scheme for ST Students', grades: 'IITs, IIMs, AIIMS, NLUs, NITs', amount: 'Full Tuition + ₹86,000 allowance', legacyPortal: 'NSP Portal' },
  { id: 'NFST', name: 'National Fellowship for Higher Education (NFST)', grades: 'M.Phil & Ph.D. Scholars', amount: '₹37,000/mo + HRA (JRF/SRF)', legacyPortal: 'Canara Bank SFMP Portal' },
  { id: 'NOS', name: 'National Overseas Scholarship (NOS)', grades: 'Masters & Ph.D. Abroad (Top 500 QS)', amount: 'Full Tuition + $15,400 USD/yr + Airfare', legacyPortal: 'NOS Standalone Portal' }
];

let applications = [
  {
    applicationId: 'MOTA-2026-POST-4891',
    studentVaultId: 'VAULT-ST-9981-JH',
    apaarId: '9843-1289-4401',
    studentName: 'Birsa Soren',
    schemeType: 'POST_MATRIC',
    schemeName: 'Post-Matric Scholarship for ST Students',
    academicYear: 2026,
    sanctionedAmount: 48000,
    institutionName: 'Birsa Institute of Technology (BIT Sindri)',
    status: 'PFMS_PUSHED', // Stage 4
    npciAadhaarSeeded: true,
    bankAccountMasked: 'SBI •••• 4891',
    ifscCode: 'SBIN0001234',
    utrNumber: 'SBIN202688419082',
    deficiencyRemarks: null,
    timeline: [
      { stage: 'Application Submitted', completed: true, timestamp: '10 Aug 2026, 11:30 AM' },
      { stage: 'DigiLocker & Institute Auto-Verified', completed: true, timestamp: '14 Aug 2026, 04:15 PM' },
      { stage: 'State Tribal Welfare Sanctioned', completed: true, timestamp: '01 Sep 2026, 02:00 PM' },
      { stage: 'PFMS / Canara SFMP Pushed (UTR Generated)', completed: true, timestamp: '15 Sep 2026, 10:45 AM' },
      { stage: 'NPCI Aadhaar-DBT Bank Credit', completed: false, timestamp: 'Expected within 24-48 hrs' }
    ]
  }
];

// District Coverage Gap dataset
const DISTRICT_GAPS = [
  { district: 'Mayurbhanj (Odisha)', enrolled: 45200, availed: 31400, coverage: 69.4, pvtg: 'Santhal, Lodha', intervention: 'Organize EMRS & ITDA direct mobile enrollment camps.' },
  { district: 'Bastar (Chhattisgarh)', enrolled: 38900, availed: 22100, coverage: 56.8, pvtg: 'Maria, Gond', intervention: 'Deploy Offline Mesh Sync Units for remote forest hamlets.' },
  { district: 'Khunti & Ranchi (Jharkhand)', enrolled: 41200, availed: 32800, coverage: 79.6, pvtg: 'Birhor, Asur', intervention: 'Focus on Post-Matric to Top Class / NFST higher transition.' },
  { district: 'Dahod (Gujarat)', enrolled: 29400, availed: 23500, coverage: 79.9, pvtg: 'Bhil, Patelia', intervention: 'NPCI bank account Aadhaar-seeding camp for Class 10 graduates.' },
  { district: 'Adilabad (Telangana)', enrolled: 21800, availed: 14200, coverage: 65.1, pvtg: 'Kolam, Gond', intervention: 'Door-to-door tribal community worker outreach with JAGO multilingual app.' }
];

// 1. Get Schemes
app.get('/api/v1/scholarships/schemes', (req, res) => {
  res.json(SCHEMES);
});

// 2. Get Applications
app.get('/api/v1/scholarships/applications', (req, res) => {
  res.json(applications);
});

// 3. Verify with DigiLocker / APAAR / State e-District
app.post('/api/v1/scholarships/verify-digilocker', (req, res) => {
  const { apaarId, casteCertNo, aisheCode } = req.body;
  setTimeout(() => {
    res.json({
      verified: true,
      studentName: 'Birsa Soren',
      tribeName: 'Scheduled Tribe (Santhal - PVTG Registered)',
      apaarId: apaarId || '9843-1289-4401',
      casteCertNo: casteCertNo || 'JH-ST-2024-998120',
      incomeAnnual: '₹ 1,40,000 (Within EWS/ST Ceiling)',
      domicileState: 'Jharkhand',
      institutionVerified: true,
      institutionName: 'Birsa Institute of Technology (BIT Sindri)',
      npciAadhaarSeeded: true,
      digiLockerBadge: 'VERIFIED_GOLD'
    });
  }, 800);
});

// 4. Submit Application with Single-Benefit De-duplication Rule Engine
app.post('/api/v1/scholarships/apply', (req, res) => {
  const { schemeType, academicYear, studentVaultId, studentName } = req.body;
  const year = parseInt(academicYear) || 2026;

  // Single-Benefit De-duplication Check
  const activeConflict = applications.find(
    app => app.academicYear === year &&
    ['STATE_SANCTIONED', 'PFMS_PUSHED', 'DISBURSED', 'INSTITUTE_APPROVED'].includes(app.status)
  );

  if (activeConflict && activeConflict.schemeType !== schemeType) {
    return res.status(400).json({
      success: false,
      error: `Single-Benefit Policy Violation: Student already holds active benefit for [${activeConflict.schemeName}] in academic year ${year}. Multiple concurrent central maintenance stipends are strictly prohibited.`
    });
  }

  const schemeObj = SCHEMES.find(s => s.id === schemeType) || SCHEMES[1];
  const newApp = {
    applicationId: `MOTA-${year}-${schemeType.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentVaultId: studentVaultId || 'VAULT-ST-9981-JH',
    apaarId: '9843-1289-4401',
    studentName: studentName || 'Birsa Soren',
    schemeType: schemeType,
    schemeName: schemeObj.name,
    academicYear: year,
    sanctionedAmount: schemeType === 'NFST' ? 444000 : schemeType === 'NOS' ? 1850000 : 48000,
    institutionName: 'Birsa Institute of Technology (BIT Sindri)',
    status: 'DIGILOCKER_VERIFIED',
    npciAadhaarSeeded: true,
    bankAccountMasked: 'SBI •••• 4891',
    ifscCode: 'SBIN0001234',
    utrNumber: 'PENDING_SANCTION',
    timeline: [
      { stage: 'Application Submitted', completed: true, timestamp: new Date().toLocaleString() },
      { stage: 'DigiLocker & Institute Auto-Verified', completed: true, timestamp: new Date().toLocaleString() },
      { stage: 'State Tribal Welfare Sanctioned', completed: false, timestamp: 'Under Review' },
      { stage: 'PFMS / Canara SFMP Pushed', completed: false, timestamp: 'Pending' },
      { stage: 'NPCI Aadhaar-DBT Bank Credit', completed: false, timestamp: 'Pending' }
    ]
  };

  applications.unshift(newApp);
  res.json({ success: true, application: newApp, message: 'Application submitted and pre-verified successfully via DigiLocker!' });
});

// 5. Coverage Gap Analytics (UDISE+ / APAAR / OTR matching)
app.get('/api/v1/scholarships/gap-analytics', (req, res) => {
  res.json(DISTRICT_GAPS);
});

// 6. JAGO Multilingual Conversational AI
app.post('/api/v1/scholarships/jago-chat', (req, res) => {
  const { query, lang = 'en', studentName = 'Birsa' } = req.body;
  const q = (query || '').toLowerCase().trim();

  let answer = '';
  if (q.includes('dbt') || q.includes('status') || q.includes('paisa') || q.includes('money') || q.includes('disburs') || q.includes('payment')) {
    if (lang === 'hi') {
      answer = `नमस्ते ${studentName}! आपकी पोस्ट-मैट्रिक छात्रवृत्ति (₹48,000) राज्य कल्याण विभाग से स्वीकृत होकर PFMS गेटवे (UTR: SBIN202688419082) पर भेजी गई है। आपके SBI खाते (•••• 4891) में 24-48 घंटों में DBT जमा हो जाएगी।`;
    } else if (lang === 'or') {
      answer = `ନମସ୍କାର ${studentName}! ଆପଣଙ୍କ ପୋଷ୍ଟ-ମାଟ୍ରିକ ବୃତ୍ତି (₹48,000) ମଞ୍ଜୁର ହୋଇ PFMS କୁ ପଠାଯାଇଛି | ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରେ ଖୁବ ଶୀଘ୍ର ଜମା ହେବ |`;
    } else if (lang === 'st') {
      answer = `Johar ${studentName}! Amak Post-Matric scholarship (₹48,000) do PFMS thec sen akana. 24-48 ghonta bhitir te bank account re joma aa.`;
    } else {
      answer = `Namaste ${studentName}! Your Post-Matric scholarship (₹48,000) has passed State Sanction and is pushed to PFMS (UTR: SBIN202688419082). Expected DBT credit to SBI •••• 4891 within 24-48 hours.`;
    }
  } else if (q.includes('nfst') || q.includes('fellowship') || q.includes('phd') || q.includes('mphil')) {
    answer = `National Fellowship for Higher Education (NFST) offers JRF fellowship @ ₹37,000/month + HRA. Automated verification is enabled via UGC-NTA NET roll number and Canara Bank SFMP integration.`;
  } else if (q.includes('nos') || q.includes('overseas') || q.includes('abroad') || q.includes('foreign')) {
    answer = `National Overseas Scholarship (NOS) provides 100% tuition fees, annual maintenance allowance of $15,400 USD / £9,900 GBP, and economy airfare for ST students admitted into Top 500 QS World Ranked Universities!`;
  } else if (q.includes('digilocker') || q.includes('caste') || q.includes('certificate') || q.includes('document')) {
    answer = `DigiLocker integration lets you link your ST/PVTG Certificate, APAAR ID, and Income Certificate instantly with zero manual document uploads!`;
  } else if (q.includes('dedup') || q.includes('two') || q.includes('multiple') || q.includes('both')) {
    answer = `Under MoTA rules, an ST student can avail only ONE central stipend/maintenance scholarship per academic year to ensure fair distribution, but you can seamlessly transition to higher schemes like Top Class or NFST upon admission.`;
  } else {
    answer = `Namaste! I am JAGO, your 24/7 AI guide for MoTA Scholarships. Ask me about any of the 5 schemes (Pre/Post-Matric, Top Class, NFST, NOS), your DBT payment status, or DigiLocker verification.`;
  }

  res.json({ answer, lang, timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`🏛️  MoTA Unified Scholarship Portal Live:`);
  console.log(`👉 Local Computer:  http://localhost:${PORT}`);
  console.log(`👉 Mobile on Wi-Fi: http://10.227.13.34:${PORT}`);
  console.log(`👉 Mobile on LAN:   http://10.213.36.71:${PORT}`);
  console.log(`================================================================`);
});
