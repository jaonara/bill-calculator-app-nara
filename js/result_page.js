document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'elecbill_results';
  const statsEl = document.getElementById('resultsStats');
  const insightEl = document.getElementById('insightBanner');
  const tableContainer = document.getElementById('resultsTableContainer');
  const totalCountEl = document.getElementById('totalCount');

  function formatCurrency(v) {
    return '₱' + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function loadResults() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function renderStats(results) {
    if (!statsEl) return;
    if (results.length === 0) {
      statsEl.innerHTML = '';
      return;
    }
    const totalBill = results.reduce((s,r) => s + (r.total||0), 0);
    const avgBill = totalBill / results.length;
    const totalUsage = results.reduce((s,r) => s + (r.consumption||0), 0);
    const highestBill = results.reduce((m,r) => Math.max(m, r.total||0), 0);
    statsEl.innerHTML = `
      <div class="stat-card"><img src="images/peso small.png" alt="Total Bills" width="48" height="48"><h3>Total Bills</h3><p class="stat-value">${formatCurrency(totalBill)}</p><small>All time</small></div>
      <div class="stat-card"><img src="images/trend.png" alt="Average Bill" width="48" height="48"><h3>Average Bill</h3><p class="stat-value">${formatCurrency(avgBill)}</p><small>Per Month</small></div>
      <div class="stat-card"><img src="images/bolt_small.png" alt="Total Usage" width="48" height="48"><h3>Total Usage</h3><p class="stat-value">${totalUsage.toLocaleString()} kWh</p><small>All time</small></div>
      <div class="stat-card"><img src="images/trend.png" alt="Average Bill" width="48" height="48"><h3>Highest Bill</h3><p class="stat-value">${formatCurrency(highestBill)}</p><small>Peak Time</small></div>
    `;

  }

  function renderInsight(results) {
    if (!insightEl) return;
    if (results.length === 0) {
      insightEl.innerHTML = '';
      return;
    }
    const highestResult = results.reduce((max, r) => (r.total > max.total) ? r : max);
    insightEl.innerHTML = `
      <div class="insight-box">
        <img src="images/trend.png" alt="Trend" class="insight-icon" width="48" height="48">
        <p>Your highest bill was <strong>${formatCurrency(highestResult.total)}</strong> in <strong>${highestResult.period}</strong>(<strong>${highestResult.consumption} kWh</strong>)</p>
      </div>
    `;
  }

  function renderTable(results) {
    totalCountEl.textContent = results.length;
    if (results.length === 0) {
      tableContainer.innerHTML = `<div class="empty-state"><p>No bills yet</p><small>Start by calculating your first electricity bill</small></div>`;
      return;
    }
    const rows = results.map((r, idx) => `
      <tr data-idx="${idx}">
        <td>${r.period || '—'}</td>
        <td>${(r.consumption||0).toLocaleString()} kWh</td>
        <td>₱ ${Number(r.rate||0).toFixed(2)}</td>
        <td>₱ ${Number(r.total||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
        <td><button class="btn-action-delete" data-idx="${idx}" aria-label="Delete"><img src="images/delete.png" alt="Delete" class="icon-delete" width="20" height="20"></button></td>
      </tr>
    `).join('');
    tableContainer.innerHTML = `
      <table class="results-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Consumption (kWh)</th>
            <th>Rate (₱/kWh)</th>
            <th>Total (₱)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    tableContainer.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        const results = loadResults();
        results.splice(idx, 1);
        localStorage.setItem(KEY, JSON.stringify(results));
        try {
          const bc = new BroadcastChannel('elecbill_channel');
          bc.postMessage({ type: 'results_changed' });
          bc.close();
        } catch (err) {
          localStorage.setItem('elecbill_update', Date.now().toString());
        }
        renderAll();
      });
    });
  }

  function renderAll() {
    const results = loadResults();
    renderStats(results);
    renderInsight(results);
    renderTable(results);
  }

  try {
    const bc = new BroadcastChannel('elecbill_channel');
    bc.addEventListener('message', (ev) => {
      if (!ev.data) return;
      if (ev.data.type === 'new_result' || ev.data.type === 'results_changed') {
        renderAll();
      }
    });
  } catch (err) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'elecbill_update' || e.key === KEY) {
        renderAll();
      }
    });
  }

  renderAll();
});