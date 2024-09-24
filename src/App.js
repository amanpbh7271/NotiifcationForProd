import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.js';
import IncidentContainer from './components/IncidentContainer.jsx';
import UpdateIncDetails from './components/UpdateIncDetails.jsx';
import IncidentsList from './components/IncidentsList.jsx';
import DesktopNotification from './components/DesktopNotification.jsx'; // Import the DesktopNotification component
import { isLoggedIn } from './utils/auth'; // Import your authentication function
import RegistrationForm from './components/RegistrationForm.jsx'



function App() {
  const isAuthenticated = isLoggedIn(); // Determine if the user is authenticated
  const [userDetails, setUserDetails] = useState(null); // State to store user details after login

  const handleLoginSuccess = (userDetails) => {
    setUserDetails(userDetails); // Update user details after login
  };


 
  return (
      <div className="App">

        <BrowserRouter>
        {isAuthenticated && userDetails && (
          <DesktopNotification />
        )}
          <Routes>
            <Route path="/LoginForm" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/IncidentContainer" element={<IncidentContainer />} />
            <Route path="/UpdateIncDetails/:id" element={<UpdateIncDetails />} />

            <Route
            path="/IncidentsList" // Update path to match the component
            element={isAuthenticated ? <IncidentsList/> : <Navigate to="/LoginForm" />}
          />
            <Route path="/RegistrationForm" element={<RegistrationForm />} />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
