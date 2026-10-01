let currentLanguage = 'en';
let isVoiceOutputActive = true;
let isVoiceRecording = false;
const API_ROOT = window.location.origin;
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setupMobileInstallModal();
  setupNavigationTabs();
  setupAccessibilityControls();
  fetchAndRenderSchemes();
  fetchAndRenderGapAnalytics();
  setupJagoAssistant();
  setupDigiLockerActions();
  setupApplicationForm();
});

// Register Service Worker for PWA Offline & Installability
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ MoTA Service Worker Registered'))
      .catch((err) => console.log('Service worker error:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btnNative = document.getElementById('btnTriggerNativeInstall');
    if (btnNative) {
      btnNative.classList.remove('opacity-50');
      btnNative.innerText = '📲 Tap to Install App on This Device';
    }
  });
}

function setupMobileInstallModal() {
  const openBtn = document.getElementById('btnOpenMobileInstall');
  const closeBtn = document.getElementById('btnCloseMobileInstall');
  const modal = document.getElementById('modalMobileInstall');
  const btnTrigger = document.getElementById('btnTriggerNativeInstall');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (btnTrigger) {
    btnTrigger.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          renderToast('🎉 Installing MoTA App to your Home Screen...');
        }
        deferredPrompt = null;
      } else {
        renderToast('ℹ️ To install on mobile, scan the QR code or tap Add to Home Screen in your mobile browser!');
      }
    });
  }
}

// 1. Navigation Tabs Wiring
function setupNavigationTabs() {
  const navItems = [
    { buttonId: 'tabDashboard', viewId: 'viewDashboard' },
    { buttonId: 'tabApply', viewId: 'viewApply' },
    { buttonId: 'tabDigiLocker', viewId: 'viewDigiLocker' },
    { buttonId: 'tabSanctionSlip', viewId: 'viewSanctionSlip' },
    { buttonId: 'tabMinistryGap', viewId: 'viewMinistryGap' }
  ];

  navItems.forEach(item => {
    const btn = document.getElementById(item.buttonId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Deactivate all
      navItems.forEach(n => {
        const b = document.getElementById(n.buttonId);
        const v = document.getElementById(n.viewId);
        if (b) {
          b.className = 'side-nav-btn w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-[#F0F4F8] flex items-center gap-2.5 transition-all';
        }
        if (v) v.classList.add('hidden');
      });

      // Activate clicked
      btn.className = 'side-nav-btn active w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 bg-[#002B49] text-white transition-all shadow-sm';
      const activeView = document.getElementById(item.viewId);
      if (activeView) activeView.classList.remove('hidden');
    });
  });

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      renderToast(`Language switched to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }
}

// 2. Accessibility Controls
function setupAccessibilityControls() {
  document.getElementById('btnTextDec')?.addEventListener('click', () => {
    document.body.classList.remove('text-zoom-md', 'text-zoom-lg');
    document.body.classList.add('text-zoom-sm');
  });
  document.getElementById('btnTextNorm')?.addEventListener('click', () => {
    document.body.classList.remove('text-zoom-sm', 'text-zoom-lg');
    document.body.classList.add('text-zoom-md');
  });
  document.getElementById('btnTextInc')?.addEventListener('click', () => {
    document.body.classList.remove('text-zoom-sm', 'text-zoom-md');
    document.body.classList.add('text-zoom-lg');
  });
}

// 3. Fetch & Render 5 Schemes
async function fetchAndRenderSchemes() {
  try {
    const res = await fetch(`${API_ROOT}/api/v1/scholarships/schemes`);
    const schemes = await res.json();
    const container = document.getElementById('schemesCardsContainer');
    if (!container) return;

    container.innerHTML = schemes.map(s => `
      <div class="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#002B49] transition-all flex flex-col justify-between space-y-2.5 shadow-sm">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold">${s.legacyPortal}</span>
            <span class="text-[10px] font-bold text-amber-700">${s.amount}</span>
          </div>
          <h4 class="text-xs font-bold text-[#002B49] mt-1.5 leading-snug">${s.name}</h4>
          <p class="text-[10px] text-slate-500 mt-1">Eligible: <span class="text-slate-800 font-medium">${s.grades}</span></p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] text-emerald-700 font-semibold"><i class="fa-solid fa-circle-check"></i> Open for AY 26-27</span>
          <button onclick="triggerApplyScheme('${s.id}')" class="text-[10px] bg-[#002B49] hover:bg-[#E87722] text-white px-2.5 py-1 rounded font-bold transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load schemes:', err);
  }
}

window.triggerApplyScheme = (schemeId) => {
  document.getElementById('tabApply')?.click();
  const select = document.getElementById('inputSchemeType');
  if (select) {
    select.value = schemeId;
    toggleExtraFieldsForScheme();
  }
};

// 4. Application Form Submission & Single-Benefit Rule
function setupApplicationForm() {
  const form = document.getElementById('formSchemeApplication');
  const schemeSelect = document.getElementById('inputSchemeType');
  const errorBox = document.getElementById('boxApplyError');

  if (schemeSelect) {
    schemeSelect.addEventListener('change', toggleExtraFieldsForScheme);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.classList.add('hidden');

      const payload = {
        schemeType: schemeSelect.value,
        studentName: document.getElementById('inputStudentName').value,
        apaarId: document.getElementById('inputApaarId').value,
        casteCertNo: document.getElementById('inputCasteCert').value,
        academicYear: document.getElementById('inputYear').value,
        netRollNo: document.getElementById('inputNetRoll')?.value || null
      };

      try {
        const submitBtn = document.getElementById('btnSubmitForm');
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying via DigiLocker & Rule Engine...';
        submitBtn.disabled = true;

        const res = await fetch(`${API_ROOT}/api/v1/scholarships/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit & Auto-Verify Application';
        submitBtn.disabled = false;

        if (!res.ok || !data.success) {
          if (errorBox) {
            errorBox.textContent = data.error || 'Validation error';
            errorBox.classList.remove('hidden');
          }
          renderToast('⚠️ Single-Benefit Conflict: You already hold an active scheme for this year', 'error');
          return;
        }

        renderToast('🎉 Application successfully registered and verified via DigiLocker!');
        document.getElementById('tabDashboard')?.click();
      } catch (err) {
        console.error(err);
        if (errorBox) {
          errorBox.textContent = 'Server connection failed. Please check network.';
          errorBox.classList.remove('hidden');
        }
      }
    });
  }
}

function toggleExtraFieldsForScheme() {
  const scheme = document.getElementById('inputSchemeType').value;
  const container = document.getElementById('containerExtraFields');
  if (!container) return;
  if (scheme === 'NFST' || scheme === 'NOS') {
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

// 5. DigiLocker Sync Actions
function setupDigiLockerActions() {
  const syncBtn = document.getElementById('btnSyncDigiLocker');
  if (!syncBtn) return;

  syncBtn.addEventListener('click', async () => {
    const icon = document.getElementById('iconSyncDigi');
    if (icon) icon.classList.add('fa-spin');
    syncBtn.disabled = true;

    try {
      const res = await fetch(`${API_ROOT}/api/v1/scholarships/verify-digilocker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apaarId: '9843-1289-4401', casteCertNo: 'JH-ST-2024-998120' })
      });
      await res.json();
      if (icon) icon.classList.remove('fa-spin');
      syncBtn.disabled = false;
      renderToast('✅ DigiLocker Sync Complete: 3 Documents Verified & NPCI Seeded');
    } catch (err) {
      if (icon) icon.classList.remove('fa-spin');
      syncBtn.disabled = false;
      renderToast('DigiLocker sync failed', 'error');
    }
  });
}

// 6. Ministry Gap Analytics Table
async function fetchAndRenderGapAnalytics() {
  try {
    const res = await fetch(`${API_ROOT}/api/v1/scholarships/gap-analytics`);
    const districts = await res.json();
    const tbody = document.getElementById('bodyGapAnalytics');
    if (!tbody) return;

    tbody.innerHTML = districts.map(d => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-2.5 font-semibold text-[#002B49]">${d.district}</td>
        <td class="p-2.5 font-mono text-blue-800">${d.enrolled.toLocaleString()}</td>
        <td class="p-2.5 font-mono text-emerald-800 font-bold">${d.availed.toLocaleString()}</td>
        <td class="p-2.5 font-mono text-rose-700 font-bold">${(d.enrolled - d.availed).toLocaleString()}</td>
        <td class="p-2.5">
          <div class="flex items-center gap-2">
            <span class="font-mono text-amber-700 font-bold">${d.coverage}%</span>
            <div class="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: ${d.coverage}%"></div>
            </div>
          </div>
        </td>
        <td class="p-2.5 text-slate-600 text-[10px]">${d.intervention}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 7. JAGO Multilingual Conversational AI & Voice Guide
function setupJagoAssistant() {
  const toggleBtn = document.getElementById('btnToggleJago');
  const closeBtn = document.getElementById('btnCloseJagoModal');
  const modal = document.getElementById('modalJagoChat');
  const sendBtn = document.getElementById('btnSendJagoMessage');
  const input = document.getElementById('inputJagoQuery');
  const voiceBtn = document.getElementById('btnVoicePushToTalk');
  const ttsToggle = document.getElementById('btnVoiceTtsToggle');

  const toggleModal = () => {
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      input.focus();
    }
  };

  if (toggleBtn) toggleBtn.addEventListener('click', toggleModal);
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  document.querySelectorAll('.chip-prompt').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent.trim().replace(/^[^\w]+/, '');
      triggerSendMessage();
    });
  });

  const triggerSendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    appendJagoMessage('user', text);
    input.value = '';

    try {
      const res = await fetch(`${API_ROOT}/api/v1/scholarships/jago-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, lang: currentLanguage, studentName: 'Birsa Soren' })
      });
      const data = await res.json();
      appendJagoMessage('bot', data.answer);
      if (isVoiceOutputActive) {
        speakJagoAudio(data.answer, currentLanguage);
      }
    } catch (err) {
      appendJagoMessage('bot', 'Sorry, could not connect to MoTA JAGO gateway.');
    }
  };

  if (sendBtn) sendBtn.addEventListener('click', triggerSendMessage);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSendMessage();
    });
  }

  if (ttsToggle) {
    ttsToggle.addEventListener('click', () => {
      isVoiceOutputActive = !isVoiceOutputActive;
      document.getElementById('iconTtsVoice').className = isVoiceOutputActive ? 'fa-solid fa-volume-high text-emerald-400' : 'fa-solid fa-volume-xmark text-slate-400';
      renderToast(isVoiceOutputActive ? 'Voice speech enabled' : 'Voice speech muted');
    });
  }

  // Voice Input (Web Speech Recognition)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && voiceBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
      if (isVoiceRecording) {
        recognition.stop();
        return;
      }
      recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'or' ? 'or-IN' : 'en-IN';
      recognition.start();
      isVoiceRecording = true;
      document.getElementById('iconMicActive').className = 'fa-solid fa-microphone-lines animate-pulse text-rose-600';
      renderToast('🎙️ Listening in ' + (currentLanguage === 'hi' ? 'Hindi' : 'English') + '... speak now');
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      isVoiceRecording = false;
      document.getElementById('iconMicActive').className = 'fa-solid fa-microphone';
      triggerSendMessage();
    };

    recognition.onerror = () => {
      isVoiceRecording = false;
      document.getElementById('iconMicActive').className = 'fa-solid fa-microphone';
    };

    recognition.onend = () => {
      isVoiceRecording = false;
      document.getElementById('iconMicActive').className = 'fa-solid fa-microphone';
    };
  }
}

function appendJagoMessage(sender, text) {
  const container = document.getElementById('listJagoMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `flex items-start gap-2 ${sender === 'user' ? 'justify-end' : ''}`;

  if (sender === 'user') {
    div.innerHTML = `
      <div class="bg-[#002B49] text-white font-medium p-2.5 rounded-xl rounded-tr-none text-xs max-w-[85%] leading-relaxed shadow-sm">
        ${text}
      </div>
    `;
  } else {
    div.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] flex-shrink-0 font-bold">
        🤖
      </div>
      <div class="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-none text-slate-800 leading-relaxed max-w-[85%] shadow-sm">
        ${text}
      </div>
    `;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function speakJagoAudio(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#•₹]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function renderToast(message, type = 'success') {
  const existing = document.getElementById('govPortalToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'govPortalToast';
  toast.className = `fixed top-20 right-4 z-50 px-3.5 py-2 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 border transition-all ${
    type === 'error' ? 'bg-rose-900 text-white border-rose-950' : 'bg-[#002B49] text-white border-[#E87722]'
  }`;
  toast.innerHTML = `<i class="${type === 'error' ? 'fa-solid fa-triangle-exclamation text-amber-300' : 'fa-solid fa-circle-check text-emerald-400'}"></i> ${message}`;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
