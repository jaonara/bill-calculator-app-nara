document.addEventListener('DOMContentLoaded', async function () {
  // Check authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  const editBtn = document.querySelector('.btn-edit');
  const changePasswordBtn = document.querySelector('.btn-change-password');
  const logoutBtn = document.querySelector('.btn-logout');

  const profileForm = document.querySelector('.profile-form');
  const fullnameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const addressInput = document.getElementById('address');
  const phoneInput = document.getElementById('phone');

  const modal = document.getElementById('changePasswordModal');
  const closeElements = modal ? modal.querySelectorAll('[data-close]') : [];
  const changeForm = document.getElementById('changePasswordForm');
  const currentInput = document.getElementById('currentPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmPassword');

  let isEditing = false;

  // Load user profile from Supabase
  async function loadUserData() {
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('fullname, email, address, phone')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        fullnameInput.value = profile.fullname || '';
        emailInput.value = profile.email || user.email || '';
        addressInput.value = profile.address || '';
        phoneInput.value = profile.phone || '';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to user email
      emailInput.value = user.email || '';
    }
  }

  await loadUserData();

  // Edit Profile button — toggle edit mode
  if (editBtn) {
    editBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      isEditing = !isEditing;

      if (isEditing) {
        // enable editing
        fullnameInput.disabled = false;
        emailInput.disabled = false;
        addressInput.disabled = false;
        phoneInput.disabled = false;
        profileForm.disabled = false;
        editBtn.textContent = '💾 Save Changes';
        editBtn.classList.add('editing');
      } else {
        // save changes to Supabase
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const address = addressInput.value.trim();
        const phone = phoneInput.value.trim();

        try {
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
            }
          }

          // disable editing
          fullnameInput.disabled = true;
          emailInput.disabled = true;
          addressInput.disabled = true;
          phoneInput.disabled = true;
          profileForm.disabled = true;
          editBtn.textContent = '✏️ Edit Profile';
          editBtn.classList.remove('editing');
          alert('Profile updated successfully!');
        } catch (error) {
          alert('Error updating profile: ' + error.message);
          console.error('Update error:', error);
        }
      }
    });
  }

  // Change Password Modal
  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    currentInput.value = newInput.value = confirmInput.value = '';
    setTimeout(() => currentInput.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  closeElements.forEach(el => el.addEventListener('click', closeModal));
  modal && modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  if (changeForm) {
    changeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cur = currentInput.value.trim();
      const nw = newInput.value.trim();
      const cf = confirmInput.value.trim();

      if (!nw || nw.length < 6) {
        alert('Use a password with at least 6 characters');
        newInput.focus();
        return;
      }
      if (nw !== cf) {
        alert('Passwords do not match');
        confirmInput.focus();
        return;
      }

      try {
        const { error } = await supabaseClient.auth.updateUser({
          password: nw
        });

        if (error) throw error;

        closeModal();
        alert('Password changed successfully');
      } catch (error) {
        alert('Error changing password: ' + error.message);
        console.error('Password change error:', error);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!confirm('Are you sure you want to logout?')) return;
      
      await supabaseClient.auth.signOut();
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }
});

