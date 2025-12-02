document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editForm');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Load current data
  document.getElementById('fullname').value = currentUser.fullname || '';
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('address').value = currentUser.address || '';
  document.getElementById('phone').value = currentUser.phone || '';

  // Handle form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const updated = {
      ...currentUser,
      fullname: document.getElementById('fullname').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      phone: document.getElementById('phone').value.trim()
    };

    localStorage.setItem('currentUser', JSON.stringify(updated));
    alert('✅ Profile updated successfully!');
    window.location.href = 'profile.html';
  });
});