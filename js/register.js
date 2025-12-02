document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Extract first name
    const firstName = fullname.split(' ')[0];

    // Save user data to localStorage
    const userData = {
      fullname: fullname,
      firstName: firstName,
      email: email,
      address: address,
      phone: phone,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Redirect to dashboard after successful registration
    window.location.href = 'user_dashboard.html';
  });
});