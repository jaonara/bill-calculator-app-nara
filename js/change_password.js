document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('passwordForm');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate old password
    if (currentUser.password && currentUser.password !== oldPassword) {
      alert('❌ Current password is incorrect');
      return;
    }

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

    // Update password
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert('✅ Password changed successfully!');
    window.location.href = 'profile.html';
  });
});