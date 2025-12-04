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

      // Update profile with additional info (trigger should handle creation, we just update address/phone)
      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            address: address,
            phone: phone
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          // Don't throw - user is created, profile update is optional
        }
      }

      alert('Registration successful! Please check your email to verify your account.');
      window.location.href = 'login.html';
    } catch (error) {
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables not set up. Please run the schema.sql file in Supabase SQL Editor first.';
      } else if (error.message.includes('profiles') || error.message.includes('bills')) {
        errorMessage = 'Database error: ' + error.message + '\n\nMake sure you have run schema.sql in Supabase SQL Editor.';
      }
      
      alert('Registration failed: ' + errorMessage);
      console.error('Registration error:', error);
    }
  });
});