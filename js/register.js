document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async function (e) {
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

    try {
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            fullname: fullname,
            address: address,
            phone: phone
          }
        }
      });

      if (authError) throw authError;

      // Update profile with additional info (trigger should handle this, but update if needed)
      if (authData.user) {
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            address: address,
            phone: phone
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      alert('Registration successful! Please check your email to verify your account.');
      window.location.href = 'login.html';
    } catch (error) {
      alert('Registration failed: ' + error.message);
      console.error('Registration error:', error);
    }
  });
});