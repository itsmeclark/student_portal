(() => {
  const SCHEDULE_KEY = 'cec-portal-schedules';
  const PROFILE_KEY = 'cec-portal-profile';
  const defaultSchedules = [
    { subject: 'PATHFIT 4', day: 'THURSDAY', time: '7:30 AM - 8:30 AM', room: 'GYM 2', instructor: 'MS. ANNA CRUZ' },
    { subject: 'PATHFIT 4', day: 'THURSDAY', time: '8:30 AM - 9:30 AM', room: 'GYM 2', instructor: 'MS. ANNA CRUZ' },
    { subject: 'GE 7', day: 'MONDAY', time: '8:30 AM - 9:30 AM', room: 'K104', instructor: 'MS. SUAN LAKE' },
    { subject: 'GE 7', day: 'WEDNESDAY', time: '8:30 AM - 9:30 AM', room: 'K104', instructor: 'MS. SUAN LAKE' },
    { subject: 'SSPD', day: 'WEDNESDAY', time: '9:30 AM - 10:30 AM', room: 'G202', instructor: 'MS. HANY SO' },
    { subject: 'IT IPT22', day: 'SATURDAY', time: '10:30 AM - 12:00 PM', room: 'CL1', instructor: 'MR. RALPH SY' },
    { subject: 'IT HCI 22', day: 'MONDAY', time: '12:00 PM - 1:30 PM', room: 'CL2', instructor: 'MS. GRACE LEE' },
    { subject: 'IT HCI 22', day: 'WEDNESDAY', time: '12:00 PM - 1:30 PM', room: 'CL2', instructor: 'MS. GRACE LEE' },
    { subject: 'IT DSA 22', day: 'TUESDAY', time: '4:30 PM - 6:00 PM', room: 'OCL', instructor: 'MR. EJ SILVERA' },
    { subject: 'IT DSA 22', day: 'FRIDAY', time: '4:30 PM - 6:00 PM', room: 'OCL', instructor: 'MR. EJ SILVERA' },
    { subject: 'IT ADS', day: 'MONDAY', time: '7:30 AM - 9:00 AM', room: 'CL2', instructor: 'MS. CARMEN LIM' },
    { subject: 'IT ADS', day: 'WEDNESDAY', time: '7:30 AM - 9:00 AM', room: 'CL2', instructor: 'MS. CARMEN LIM' },
    { subject: 'IT ADET 22', day: 'TUESDAY', time: '7:30 AM - 9:00 AM', room: 'CL4', instructor: 'MR. LARS SATOR' },
    { subject: 'IT ADET 22', day: 'FRIDAY', time: '7:30 AM - 9:00 AM', room: 'CL4', instructor: 'MR. LARS SATOR' }
  ];
  const defaultProfile = {
    name: 'Gemar Enopia',
    email: 'gemarenopia@gmail.com',
    contact: '09123456789',
    address: 'Cebu City',
    emergencyNumber: '09112233445',
    emergencyName: 'Maria Enopia'
  };
  const fields = ['subject', 'day', 'time', 'room', 'instructor'];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  function timeToMinutes(value) {
    const match = value.trim().match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i);
    if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) return null;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hour += 12;
    return hour * 60 + Number(match[2]);
  }

  function validateSchedule(schedule) {
    if (!schedule || fields.some((field) =>
      typeof schedule[field] !== 'string' || schedule[field].trim() === ''
    )) {
      throw new Error('Every schedule field is required.');
    }
    if (!days.includes(schedule.day.toUpperCase())) {
      throw new Error('Choose a class day from Monday to Saturday.');
    }
    const timeParts = schedule.time.split(/\s*-\s*/);
    if (timeParts.length !== 2) {
      throw new Error('Enter the time as “7:30 AM - 8:30 AM”.');
    }
    const start = timeToMinutes(timeParts[0]);
    const end = timeToMinutes(timeParts[1]);
    if (start === null || end === null || start >= end) {
      throw new Error('Enter a valid start and end time, with the end later than the start.');
    }
  }

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      throw new Error(`Browser storage is unavailable: ${error.message}`);
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new Error(`Could not save data in browser storage: ${error.message}`);
    }
  }

  function validateSchedules(value) {
    if (!Array.isArray(value)) {
      throw new Error('Saved schedule data is invalid. Clear this site’s saved data to restore the sample schedule.');
    }
    if (value.some((item) =>
      !item || fields.some((field) => typeof item[field] !== 'string')
    )) {
      throw new Error('Saved schedule data is invalid. Clear this site’s saved data to restore the sample schedule.');
    }
    return value;
  }

  function loadSchedules() {
    const saved = read(SCHEDULE_KEY);
    if (saved === null) {
      write(SCHEDULE_KEY, defaultSchedules);
      return defaultSchedules.map((item) => ({ ...item }));
    }
    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch (error) {
      throw new Error(`Could not read saved schedules: ${error.message}`);
    }
    return validateSchedules(parsed);
  }

  function saveSchedules(schedules) {
    write(SCHEDULE_KEY, validateSchedules(schedules));
  }

  function loadProfile() {
    const saved = read(PROFILE_KEY);
    if (saved === null) return { ...defaultProfile };
    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch (error) {
      throw new Error(`Could not read saved profile: ${error.message}`);
    }
    if (!parsed || Object.keys(defaultProfile).some((field) => typeof parsed[field] !== 'string')) {
      throw new Error('Saved profile data is invalid. Clear this site’s saved data to restore the sample profile.');
    }
    return { ...defaultProfile, ...parsed };
  }

  function saveProfile(profile) {
    write(PROFILE_KEY, profile);
  }

  const logoutModal = document.getElementById('logoutModal');
  if (logoutModal) {
    let activeLogoutButton = null;

    function closeLogoutModal() {
      logoutModal.classList.add('hidden');
      logoutModal.setAttribute('aria-hidden', 'true');
      if (activeLogoutButton) activeLogoutButton.focus();
    }

    document.querySelectorAll('.logout').forEach((button) => {
      button.addEventListener('click', () => {
        activeLogoutButton = button;
        logoutModal.classList.remove('hidden');
        logoutModal.setAttribute('aria-hidden', 'false');
        logoutModal.querySelector('[data-close-logout]').focus();
      });
    });

    logoutModal.querySelectorAll('[data-close-logout]').forEach((button) => {
      button.addEventListener('click', closeLogoutModal);
    });
    document.getElementById('confirmLogoutBtn').addEventListener('click', closeLogoutModal);
    logoutModal.addEventListener('click', (event) => {
      if (event.target === logoutModal) closeLogoutModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !logoutModal.classList.contains('hidden')) {
        closeLogoutModal();
      }
    });
  } else {
    document.querySelectorAll('.logout').forEach((button) => {
    button.addEventListener('click', () => {
      window.confirm('Are you sure you want to log out?');
    });
  });
  }

  window.PortalData = { loadSchedules, saveSchedules, validateSchedule, loadProfile, saveProfile };
})();
