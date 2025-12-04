document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      // Store session info
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      window.location.href = 'user_dashboard.html';
    } catch (error) {
      alert('Invalid credentials: ' + error.message);
      console.error('Login error:', error);
    }
  });
});
