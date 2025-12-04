document.addEventListener('DOMContentLoaded', async function () {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

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
  });

  saveBtn.addEventListener('click', async function () {
    if (saveBtn.disabled) return;
    
    const data = JSON.parse(saveBtn.dataset.result || '{}');
    
    try {
      const { error } = await supabaseClient
        .from('bills')
        .insert({
          user_id: user.id,
          period: data.period,
          consumption: data.consumption,
          rate: data.rate,
          total: data.total
        });

      if (error) throw error;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved ✓';
      setTimeout(() => { saveBtn.textContent = 'Save Result'; }, 1500);
    } catch (error) {
      alert('Error saving bill: ' + error.message);
      console.error('Save error:', error);
    }
  });
});