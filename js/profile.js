document.addEventListener('DOMContentLoaded', function () {
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

  const USER_KEY = 'currentUser';
  let currentUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  let isEditing = false;

  // Load user data on page load
  function loadUserData() {
    if (currentUser.fullname) fullnameInput.value = currentUser.fullname;
    if (currentUser.email) emailInput.value = currentUser.email;
    if (currentUser.address) addressInput.value = currentUser.address;
    if (currentUser.phone) phoneInput.value = currentUser.phone;
  }

  loadUserData();

  // Edit Profile button — toggle edit mode
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
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
        // save changes
        currentUser = {
          ...currentUser,
          fullname: fullnameInput.value.trim(),
          firstName: fullnameInput.value.trim().split(' ')[0],
          email: emailInput.value.trim(),
          address: addressInput.value.trim(),
          phone: phoneInput.value.trim()
        };
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

        // disable editing
        fullnameInput.disabled = true;
        emailInput.disabled = true;
        addressInput.disabled = true;
        phoneInput.disabled = true;
        profileForm.disabled = true;
        editBtn.textContent = '✏️ Edit Profile';
        editBtn.classList.remove('editing');
        alert('Profile updated successfully!');
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
    changeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cur = currentInput.value.trim();
      const nw = newInput.value.trim();
      const cf = confirmInput.value.trim();

      if (currentUser && currentUser.password) {
        if (!cur) { alert('Enter your current password'); currentInput.focus(); return; }
        if (currentUser.password !== cur) { alert('Current password is incorrect'); currentInput.focus(); return; }
      }

      if (!nw || nw.length < 6) { alert('Use a password with at least 6 characters'); newInput.focus(); return; }
      if (nw !== cf) { alert('Passwords do not match'); confirmInput.focus(); return; }

      currentUser = { ...currentUser, password: nw };
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      closeModal();
      alert('Password changed successfully');
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!confirm('Are you sure you want to logout?')) return;
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = 'login.html';
    });
  }
});

