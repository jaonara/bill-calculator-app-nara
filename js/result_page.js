document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  const statsEl = document.getElementById('resultsStats');
  const insightEl = document.getElementById('insightBanner');
  const tableContainer = document.getElementById('resultsTableContainer');
  const totalCountEl = document.getElementById('totalCount');

  function formatCurrency(v) {
    return '₱' + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function loadResults() {
    const { data, error } = await supabaseClient
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading bills:', error);
      return [];
    }
    return data || [];
  }

  function renderStats(results) {
    if (!statsEl) return;
    if (results.length === 0) {
      statsEl.innerHTML = '';
      return;
    }
    const totalBill = results.reduce((s, r) => s + parseFloat(r.total || 0), 0);
    const avgBill = totalBill / results.length;
    const totalUsage = results.reduce((s, r) => s + parseFloat(r.consumption || 0), 0);
    const highestBill = results.reduce((m, r) => Math.max(m, parseFloat(r.total || 0)), 0);
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
    const highestResult = results.reduce((max, r) => (parseFloat(r.total || 0) > parseFloat(max.total || 0)) ? r : max);
    insightEl.innerHTML = `
      <div class="insight-box">
        <img src="images/trend.png" alt="Trend" class="insight-icon" width="48" height="48">
        <p>Your highest bill was <strong>${formatCurrency(highestResult.total)}</strong> in <strong>${highestResult.period}</strong> (<strong>${highestResult.consumption} kWh</strong>)</p>
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
      <tr data-id="${r.id}">
        <td>${r.period || '—'}</td>
        <td>${parseFloat(r.consumption || 0).toLocaleString()} kWh</td>
        <td>₱ ${Number(r.rate || 0).toFixed(2)}</td>
        <td>₱ ${Number(r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td><button class="btn-action-delete" data-id="${r.id}" aria-label="Delete"><img src="images/delete.png" alt="Delete" class="icon-delete" width="20" height="20"></button></td>
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
      btn.addEventListener('click', async () => {
        const billId = btn.dataset.id;
        if (!confirm('Are you sure you want to delete this bill?')) return;
        
        try {
          const { error } = await supabaseClient
            .from('bills')
            .delete()
            .eq('id', billId)
            .eq('user_id', user.id);

          if (error) throw error;
          await renderAll();
        } catch (error) {
          alert('Error deleting bill: ' + error.message);
          console.error('Delete error:', error);
        }
      });
    });
  }

  async function renderAll() {
    const results = await loadResults();
    renderStats(results);
    renderInsight(results);
    renderTable(results);
  }

  await renderAll();
});