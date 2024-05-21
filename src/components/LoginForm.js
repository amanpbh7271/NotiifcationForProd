import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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
      const loginResponse = await fetch("http://inpnqsmrtop01:9090/demo-0.0.1-SNAPSHOT/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();

        // Fetch the account for the user
        const accountResponse = await fetch(`http://inpnqsmrtop01:9090/demo-0.0.1-SNAPSHOT/api/accountForUser/${username}`);
        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          // Update user details with account information if userDetails exists
          if (loginData.userDetails) {
            loginData.userDetails.accounts = accountData.map(account => account.name);
          }
        } else {
          console.error('Failed to fetch account for user:', accountResponse.statusText);
        }

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
      } else {
        // If any other error occurs, display a generic error message
        setErrorMessage("An error occurred while processing your request.");
      }
    } catch (error) {
      console.error("Error:", error);
      // If an error occurs during the login process, display a generic error message
      setErrorMessage("An error occurred while processing your request.");
    }
  };

  return (
    <Container>
      <HeaderForLogin />
      <div className="login-form-container" style={{ marginTop: "100px" }}>
        <img src={amodocs} alt="Logo" className="login-logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
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
        {errorMessage && (
          <div className="error-message" style={{ marginTop: "1em" }}>
            {errorMessage}
          </div>
        )}
      </div>
      <footer> All rights are reserved by Amdocs</footer>
    </Container>
  );
}

export default LoginForm;
