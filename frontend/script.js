// script.js

// Function to check if the user is logged in
function isLoggedIn() {
  const token = localStorage.getItem('token');
  return !!token; // Returns true if the token exists, otherwise false
}

// Function to get the user's role from the token
function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = window.jwt_decode ? window.jwt_decode(token) : jwtDecode(token);
    return decoded.role; // Returns 'user' or 'admin'
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}

// Function to update the UI based on login status and user role
function updateUI() {
  if (isLoggedIn()) {
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const profileSection = document.querySelector('.profile-section');

    if (loginButton) loginButton.style.display = 'none';
    if (registerButton) registerButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'block';
    if (profileSection) profileSection.style.display = 'block';

    const role = getUserRole();
    const adminPanel = document.getElementById('admin-panel');
    if (role === 'admin' && adminPanel) {
      adminPanel.style.display = 'block';
    } else if (adminPanel) {
      adminPanel.style.display = 'none';
    }
  } else {
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const profileSection = document.querySelector('.profile-section');
    const adminPanel = document.getElementById('admin-panel');

    if (loginButton) loginButton.style.display = 'block';
    if (registerButton) registerButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// Function to toggle the dropdown menu
function toggleDropdown() {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.matches('.profile-pic')) {
    const dropdown = document.getElementById('dropdown');
    if (dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
    }
  }
};

// Registration Form Submission
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get form data
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const adminSecret = document.getElementById('admin-secret').value; // Get admin secret key

  console.log('Sending adminSecret:', adminSecret); // Debug: Log the adminSecret being sent

  try {
    // Send a POST request to the backend
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, adminSecret }), // Include adminSecret
    });

    // Check if the response is successful
      if (response.ok) {
      const data = await response.json();
      alert(`Registration successful! Role: ${data.role}`); // Show the role in the alert
      window.location.href = 'login.html'; // Redirect to the login page
    } else {
      // Handle errors from the backend
      const errorData = await response.json();
      alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Handle network or other errors
    console.error('Error during registration:', err);
    alert('An error occurred. Please try again.');
  }
});


// Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get form data
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    // Send a POST request to the backend
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // Check if the response is successful
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token); // Store the JWT token
      alert('Logged in successfully!');
      window.location.href = 'index.html'; // Redirect to the homepage
    } else {
      // Handle errors from the backend
      const errorData = await response.json();
      alert(`Login failed: ${errorData.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Handle network or other errors
    console.error('Error during login:', err);
    alert('An error occurred. Please try again.');
  }
});

// Rate User Form Submission
document.getElementById('rate-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get form data
  const ratedUserId = document.getElementById('rated-user-id').value;
  const score = document.getElementById('rating-score').value;
  const comment = document.getElementById('rating-comment').value;
  const token = localStorage.getItem('token'); // Get the JWT token

  try {
    // Send a POST request to the backend
    const response = await fetch('http://localhost:3000/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify({ ratedUserId, score, comment }),
    });

    // Check if the response is successful
    if (response.ok) {
      alert('Rating submitted successfully!');
    } else {
      // Handle errors from the backend
      const errorData = await response.json();
      alert(`Rating submission failed: ${errorData.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Handle network or other errors
    console.error('Error during rating submission:', err);
    alert('An error occurred. Please try again.');
  }
});

// Fetch Ratings for a User
document.getElementById('fetch-ratings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get the user ID to fetch ratings for
  const userId = document.getElementById('fetch-user-id').value;

  try {
    // Send a GET request to the backend
    const response = await fetch(`http://localhost:3000/ratings/${userId}`);
    const data = await response.json();

    // Display the ratings
    const ratingsList = document.getElementById('ratings-list');
    ratingsList.innerHTML = ''; // Clear previous ratings

    data.forEach((rating) => {
      const li = document.createElement('li');
      li.textContent = `${rating.raterUserId.username}: ${rating.score} stars - ${rating.comment}`;
      ratingsList.appendChild(li);
    });
  } catch (err) {
    // Handle network or other errors
    console.error('Error fetching ratings:', err);
    alert('An error occurred. Please try again.');
  }
});

// Call updateUI when the page loads
// Call updateUI when the page loads
window.onload = updateUI;

// Event listener for the logout button
document.getElementById('logout-button')?.addEventListener('click', logout);

// Event listener for the profile dropdown
document.querySelector('.profile')?.addEventListener('click', toggleDropdown);

// Event listener for closing the dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.matches('.profile-pic')) {
    const dropdown = document.getElementById('dropdown');
    if (dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
    }
  }
};

// Event listener for fetching ratings (if applicable)
document.getElementById('fetch-ratings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get the user ID to fetch ratings for
  const userId = document.getElementById('fetch-user-id').value;

  try {
    // Send a GET request to the backend
    const response = await fetch(`http://localhost:3000/ratings/${userId}`);
    const data = await response.json();

    // Display the ratings
    const ratingsList = document.getElementById('ratings-list');
    ratingsList.innerHTML = ''; // Clear previous ratings

    data.forEach((rating) => {
      const li = document.createElement('li');
      li.textContent = `${rating.raterUserId.username}: ${rating.score} stars - ${rating.comment}`;
      ratingsList.appendChild(li);
    });
  } catch (err) {
    // Handle network or other errors
    console.error('Error fetching ratings:', err);
    alert('An error occurred. Please try again.');
  }
});

// Event listener for submitting ratings (if applicable)
document.getElementById('rate-form')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get form data
  const ratedUserId = document.getElementById('rated-user-id').value;
  const score = document.getElementById('rating-score').value;
  const comment = document.getElementById('rating-comment').value;
  const token = localStorage.getItem('token'); // Get the JWT token

  try {
    // Send a POST request to the backend
    const response = await fetch('http://localhost:3000/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify({ ratedUserId, score, comment }),
    });

    // Check if the response is successful
    if (response.ok) {
      alert('Rating submitted successfully!');
    } else {
      // Handle errors from the backend
      const errorData = await response.json();
      alert(`Rating submission failed: ${errorData.message || 'Unknown error'}`);
    }
  } catch (err) {
    // Handle network or other errors
    console.error('Error during rating submission:', err);
    alert('An error occurred. Please try again.');
  }
});

// Function to toggle the dropdown menu
function toggleDropdown(event) {
  event.stopPropagation(); // Prevent window click from closing immediately
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('active');
}

// Ensure dropdown remains clickable
document.getElementById('dropdown').addEventListener('click', function(event) {
  event.stopPropagation();
});

// Close dropdown when clicking outside
window.addEventListener('click', function (event) {
  const dropdown = document.getElementById('dropdown');
  if (dropdown.classList.contains('active') && !event.target.closest('.profile')) {
    dropdown.classList.remove('active');
  }
});
// Event listener for the profile dropdown
document.querySelector('.profile')?.addEventListener('click', toggleDropdown);