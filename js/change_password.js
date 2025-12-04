document.addEventListener('DOMContentLoaded', async function () {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('passwordForm');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate new password length
    if (newPassword.trim().length < 6) {
      alert('⚠️ Password must be at least 6 characters');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      alert('❌ New passwords do not match');
      return;
    }

    try {
      // Update password in Supabase
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('✅ Password changed successfully!');
      window.location.href = 'profile.html';
    } catch (error) {
      alert('Error changing password: ' + error.message);
      console.error('Password change error:', error);
    }
  });
});