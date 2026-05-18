// ===== Telegram Web App Init =====
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#1D9E75');
  tg.setBackgroundColor('#f5f7fa');
}

// ===== Tab Switching =====
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    contents.forEach(c => c.classList.remove('active'));
    document.getElementById(target).classList.add('active');

    if (tg) tg.HapticFeedback.impactOccurred('light');
  });
});

// ===== Utility =====
function formatNumber(num) {
  return Math.round(num).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function formatDecimal(num, decimals) {
  return num.toLocaleString('uz-UZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// ===== KREDIT =====
document.getElementById('kredit-btn').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('kredit-summa').value);
  const n = parseInt(document.getElementById('kredit-muddat').value);
  const yearRate = parseFloat(document.getElementById('kredit-foiz').value);

  if (!P || !n || !yearRate || P <= 0 || n <= 0 || yearRate <= 0) {
    if (tg) tg.showAlert("Iltimos, barcha maydonlarni toʻldiring.");
    else alert("Iltimos, barcha maydonlarni toʻldiring.");
    return;
  }

  const r = yearRate / 100 / 12; // monthly interest rate

  // Annuity formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = M * n;
  const totalInterest = totalPayment - P;

  document.getElementById('kredit-oylik').textContent = formatNumber(M) + ' soʻm';
  document.getElementById('kredit-umumiy').textContent = formatNumber(totalPayment) + ' soʻm';
  document.getElementById('kredit-foiz-sum').textContent = formatNumber(totalInterest) + ' soʻm';

  const results = document.getElementById('kredit-results');
  results.classList.add('visible');

  if (tg) tg.HapticFeedback.notificationOccurred('success');
});

// ===== DEPOZIT =====
document.getElementById('depozit-btn').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('depozit-summa').value);
  const n = parseInt(document.getElementById('depozit-muddat').value);
  const yearRate = parseFloat(document.getElementById('depozit-foiz').value);

  if (!P || !n || !yearRate || P <= 0 || n <= 0 || yearRate <= 0) {
    if (tg) tg.showAlert("Iltimos, barcha maydonlarni toʻldiring.");
    else alert("Iltimos, barcha maydonlarni toʻldiring.");
    return;
  }

  // Simple interest: I = P * r * t
  const totalIncome = P * (yearRate / 100) * (n / 12);
  const monthlyIncome = totalIncome / n;
  const finalAmount = P + totalIncome;

  document.getElementById('depozit-daromad').textContent = formatNumber(totalIncome) + ' soʻm';
  document.getElementById('depozit-oylik').textContent = formatNumber(monthlyIncome) + ' soʻm';
  document.getElementById('depozit-yakuniy').textContent = formatNumber(finalAmount) + ' soʻm';

  const results = document.getElementById('depozit-results');
  results.classList.add('visible');

  if (tg) tg.HapticFeedback.notificationOccurred('success');
});

// ===== VALYUTA =====
// Approximate exchange rates (can be updated)
const rates = {
  USD_UZS: 12850,
  EUR_UZS: 14020,
  EUR_USD: 1.091
};

function getRate(from, to) {
  if (from === to) return 1;

  const key = from + '_' + to;
  const reverseKey = to + '_' + from;

  if (rates[key]) return rates[key];
  if (rates[reverseKey]) return 1 / rates[reverseKey];

  // Cross rate via UZS
  if (from === 'USD' && to === 'EUR') return 1 / rates.EUR_USD;
  if (from === 'EUR' && to === 'USD') return rates.EUR_USD;

  return null;
}

function getCurrencySymbol(code) {
  const symbols = { UZS: 'soʻm', USD: '$', EUR: '€' };
  return symbols[code] || code;
}

document.getElementById('swap-btn').addEventListener('click', () => {
  const fromSelect = document.getElementById('valyuta-from');
  const toSelect = document.getElementById('valyuta-to');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  if (tg) tg.HapticFeedback.impactOccurred('light');
});

document.getElementById('valyuta-btn').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('valyuta-summa').value);
  const from = document.getElementById('valyuta-from').value;
  const to = document.getElementById('valyuta-to').value;

  if (!amount || amount <= 0) {
    if (tg) tg.showAlert("Iltimos, summani kiriting.");
    else alert("Iltimos, summani kiriting.");
    return;
  }

  if (from === to) {
    if (tg) tg.showAlert("Iltimos, turli valyutalarni tanlang.");
    else alert("Iltimos, turli valyutalarni tanlang.");
    return;
  }

  const rate = getRate(from, to);
  if (!rate) {
    if (tg) tg.showAlert("Konvertatsiya imkoni yoʻq.");
    else alert("Konvertatsiya imkoni yoʻq.");
    return;
  }

  const result = amount * rate;

  // Format result based on currency
  let formatted;
  if (to === 'UZS') {
    formatted = formatNumber(result) + ' soʻm';
  } else {
    formatted = getCurrencySymbol(to) + ' ' + formatDecimal(result, 2);
  }

  document.getElementById('valyuta-result-amount').textContent = formatted;
  document.getElementById('valyuta-result-label').textContent =
    formatNumber(amount) + ' ' + from + ' = ' + formatted;

  const resultsEl = document.getElementById('valyuta-results');
  resultsEl.classList.add('visible');

  // Show rates
  const rateInfo = document.getElementById('valyuta-rate-info');
  rateInfo.innerHTML =
    '<p>1 USD = ' + formatNumber(rates.USD_UZS) + ' soʻm<br>' +
    '1 EUR = ' + formatNumber(rates.EUR_UZS) + ' soʻm<br>' +
    '1 EUR = ' + formatDecimal(rates.EUR_USD, 4) + ' USD</p>';

  if (tg) tg.HapticFeedback.notificationOccurred('success');
});
