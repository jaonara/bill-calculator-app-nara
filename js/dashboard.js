document.addEventListener('DOMContentLoaded', async function () {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('first_name, fullname')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error loading profile:', profileError);
  }

  const firstName = profile?.first_name || profile?.fullname?.split(' ')[0] || 'User';
  document.getElementById('userName').textContent = firstName;

  async function updateDashboard() {
    const { data: results, error } = await supabaseClient
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      return;
    }

    if (!results || results.length === 0) {
      // Show empty state
      const recentContainer = document.getElementById('recentBillsContainer');
      if (recentContainer) {
        recentContainer.innerHTML = `
          <div class="empty-state">
            <p>No bills yet</p>
            <small>Start by calculating your first electricity bill</small>
            <a href="calculator.html" class="btn btn-calculate-now">Calculate Now</a>
          </div>
        `;
      }
      return;
    }
    
    const totalBill = results.reduce((s, r) => s + parseFloat(r.total || 0), 0);
    const avgBill = totalBill / results.length;
    const totalUsage = results.reduce((s, r) => s + parseFloat(r.consumption || 0), 0);
    const highestBill = results.reduce((m, r) => Math.max(m, parseFloat(r.total || 0)), 0);

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

  // initial load
  await updateDashboard();
});