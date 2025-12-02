document.addEventListener('DOMContentLoaded', function () {
  const key = 'elecbill_results';

  // Get first name from registered user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const firstName = currentUser.firstName || currentUser.fullname?.split(' ')[0] || 'User';
  document.getElementById('userName').textContent = firstName;

  function updateDashboard() {
    const results = JSON.parse(localStorage.getItem(key) || '[]');
    if (results.length === 0) return;
    
    const totalBill = results.reduce((s,r) => s + (r.total||0), 0);
    const avgBill = totalBill / results.length;
    const totalUsage = results.reduce((s,r) => s + (r.consumption||0), 0);
    const highestBill = results.reduce((m,r) => Math.max(m, r.total||0), 0);

    document.getElementById('totalBills').textContent = '₱ ' + totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('avgBill').textContent = '₱ ' + avgBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('totalUsage').textContent = totalUsage.toLocaleString() + ' kWh';
    document.getElementById('highestBill').textContent = '₱ ' + highestBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // render recent bills
    const recentContainer = document.getElementById('recentBillsContainer');
    recentContainer.innerHTML = results.slice(0, 5).map((result) => `
      <div class="bill-item">
        <div class="bill-item-info">
          <h4>${result.period}</h4>
          <small>${result.consumption} kWh @ ₱${Number(result.rate).toFixed(2)}/kWh</small>
        </div>
        <div class="bill-item-amount">₱ ${Number(result.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    `).join('');
  }

  // initial
  updateDashboard();

  // realtime updates
  try {
    const bc = new BroadcastChannel('elecbill_channel');
    bc.addEventListener('message', (ev) => {
      if (ev.data && (ev.data.type === 'new_result' || ev.data.type === 'results_changed')) updateDashboard();
    });
  } catch (err) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'elecbill_update' || e.key === key) updateDashboard();
    });
  }
});