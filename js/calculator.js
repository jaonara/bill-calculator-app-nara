document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('billForm');
  const sPeriod = document.getElementById('sPeriod');
  const sConsumption = document.getElementById('sConsumption');
  const sRate = document.getElementById('sRate');
  const sTotal = document.getElementById('sTotal');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const summaryCard = document.getElementById('summaryCard');

  // show summary on load, hide reset until after calculation
  summaryCard.style.display = 'block';
  resetBtn.style.display = 'none';
  saveBtn.disabled = true;

  function formatCurrency(v) {
    return '₱' + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const month = document.getElementById('month').value.trim();
    const year = document.getElementById('year').value.trim();
    const consumption = parseFloat(document.getElementById('consumption').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const total = consumption * rate;

    sPeriod.textContent = (month ? month : '—') + (year ? ' ' + year : '');
    sConsumption.textContent = consumption.toLocaleString() + ' kWh';
    sRate.textContent = formatCurrency(rate) + ' kWh';
    sTotal.textContent = formatCurrency(total);

    // show reset button and enable save
    resetBtn.style.display = 'block';
    saveBtn.disabled = false;

    saveBtn.dataset.result = JSON.stringify({
      period: sPeriod.textContent,
      consumption: consumption,
      rate: rate,
      total: total,
      createdAt: new Date().toISOString()
    });

    if (window.innerWidth < 920) {
      summaryCard.scrollIntoView({ behavior: 'smooth' });
    }
  });

  resetBtn.addEventListener('click', function () {
    form.reset();
    sPeriod.textContent = '—';
    sConsumption.textContent = '— kWh';
    sRate.textContent = '— ₱/kWh';
    sTotal.textContent = '—';
    saveBtn.disabled = true;
    resetBtn.style.display = 'none';
    // keep summary visible (per request)
  });

  saveBtn.addEventListener('click', function () {
    if (saveBtn.disabled) return;
    const data = JSON.parse(saveBtn.dataset.result || '{}');
    const key = 'elecbill_results';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(data);
    localStorage.setItem(key, JSON.stringify(existing));

    // broadcast to other pages (dashboard / results) so they update instantly
    try {
      const bc = new BroadcastChannel('elecbill_channel');
      bc.postMessage({ type: 'new_result', payload: data });
      bc.close();
    } catch (err) {
      localStorage.setItem('elecbill_update', Date.now().toString());
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveBtn.textContent = 'Save Result'; }, 1500);
  });
});