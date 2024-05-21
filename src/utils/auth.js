// auth.js

// Function to check if the user is logged in
export const isLoggedIn = () => {
    // Check if the authentication token exists in local storage
    return localStorage.getItem('token') !== null;
  };
  
  // Function to logout the user
  export const logout = () => {
    // Clear authentication tokens and user details from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
  };
  