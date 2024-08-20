import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert, Button } from '@mui/material'; // Added Button import
import amodocs from "./amdocs_2.png";
import "../styles/LoginForm.css";
import HeaderForLogin from "./HeaderForLogin";

const Container = styled.div`
  background-color: #d3d3d3;
  background-size: cover;
  background-position: center;
  height: 100vh;
`;


function LoginForm({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the login API to authenticate the user
      const loginResponse = await fetch("http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userDetails", JSON.stringify(loginData.userDetails));

        // Emit the onLoginSuccess event with the updated user details
        onLoginSuccess(loginData.userDetails);

        // Navigate to the desired page after successful login
        navigate("/IncidentsList");
      } else if (loginResponse.status === 401) {
        setUsername("");
        setPassword("");
        // If authentication fails, display an error message
        setErrorMessage("Invalid username or password");
        setOpenSnackbar(true);
      } else {
        // If any other error occurs, display a generic error message
        setErrorMessage("An error occurred while processing your request.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error:", error);
      // If an error occurs during the login process, display a generic error message
      setErrorMessage("An error occurred while processing your request.");
      setOpenSnackbar(true);
    }
  };

  const handleRegisterClick = () => {
    // Navigate to the registration page
    navigate("/RegistrationForm");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container>
      <HeaderForLogin />
      <div className="login-form-container" style={{ marginTop: "100px" }}>
        <img src={amodocs} alt="Logo" className="login-logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Ntnet Id</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleRegisterClick}
          style={{ marginTop: "1em" }}
        >
          Register
        </Button>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ width: '400px' }} // Increased width
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%', fontSize: '1.2rem', padding: '20px' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <footer> All rights are reserved by Amdocs</footer>
    </Container>
  );
}

export default LoginForm;