document.addEventListener('DOMContentLoaded', async function () {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('editForm');
  
  // Load current profile data from Supabase
  async function loadProfile() {
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('fullname, email, address, phone')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        document.getElementById('fullname').value = profile.fullname || '';
        document.getElementById('email').value = profile.email || user.email || '';
        document.getElementById('address').value = profile.address || '';
        document.getElementById('phone').value = profile.phone || '';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile data');
    }
  }

  await loadProfile();

  // Handle form submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();

    try {
      // Update profile in Supabase
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          fullname: fullname,
          first_name: fullname.split(' ')[0],
          address: address,
          phone: phone
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email in auth if it changed
      if (email !== user.email) {
        const { error: emailError } = await supabaseClient.auth.updateUser({
          email: email
        });
        if (emailError) {
          console.error('Error updating email:', emailError);
          // Don't throw - profile update succeeded
        }
      }

      alert('✅ Profile updated successfully!');
      window.location.href = 'profile.html';
    } catch (error) {
      alert('Error updating profile: ' + error.message);
      console.error('Update error:', error);
    }
  });
});