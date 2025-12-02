document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    // load registered user (saved on register)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (currentUser && currentUser.email === email) {
      // if password was saved on register, check it; otherwise allow login
      if (currentUser.password && currentUser.password !== password) {
        alert('Invalid credentials');
        return;
      }

      // mark as logged in and redirect to dashboard
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('lastLogin', new Date().toISOString());
      window.location.href = 'user_dashboard.html';
      return;
    }

    alert('No account found with that email. Please register first.');
    window.location.href = 'register.html';
  });
});
