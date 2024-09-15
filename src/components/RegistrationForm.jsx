import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderForLogin from "./HeaderForLogin"; // Adjust the import path as needed
import amodocs from "./amdocs_2.png";
import "../styles/LoginForm.css";

const Container = styled.div`
  background-color: #d3d3d3;
  background-size: cover;
  background-position: center;
  height: 100vh;
`;

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    ntnet: "",
    mobile: "",
    region: [],
    account: [],
  });

  const [regions, setRegions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch regions
    fetch("http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/getAllRegions/")
      .then((response) => response.json())
      .then((data) => setRegions(data))
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);

  useEffect(() => {
    // Fetch accounts when regions change
    if (formData.region.length > 0) {
      const regionIds = formData.region
        .map((region) => region.region_id)
        .join(",");
      fetch(
        `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/getAllAccountsForRegions/${regionIds}`
      )
        .then((response) => response.json())
        .then((data) => setAccounts(data))
        .catch((error) => console.error("Error fetching accounts:", error));
    } else {
      setAccounts([]); // Clear accounts if no regions are selected
    }
  }, [formData.region]);

  const handleRegionChange = (event) => {
    const selectedRegions = event.target.value;
    setFormData((prevData) => {
      // Extract selected region IDs
      const selectedRegionIds = selectedRegions.map(region => region.region_id);
  
      // Identify accounts to keep
      const accountsToKeep = prevData.account.filter(account =>
        selectedRegionIds.includes(account.region_id)
      );
  
      // Identify new accounts based on the selected regions
      const newAccounts = accounts.filter(account =>
        selectedRegionIds.includes(account.region_id)
      );
  
      // Update form data
      return {
        ...prevData,
        region: selectedRegions,
        account: accountsToKeep.filter(account =>
          newAccounts.some(newAccount => newAccount.account_id === account.account_id)
        ),
      };
    });
  };
  
  

  const handleAccountChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      account: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      ntnet: formData.ntnet,
      mobile: formData.mobile,
      regionIds: formData.region.map((region) => region.region_id),
      accountIds: formData.account.map((account) => account.account_id),
    };

    console.log("data for registration " + JSON.stringify(payload, null, 2));
    fetch("http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/insertUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then((data) => {
        if (typeof data === "string") {
          console.log("User registered successfully:", data);
          setSnackbarMessage(data);
        } else {
          console.log("User registered successfully:", data);
          setSnackbarMessage("User registered successfully!");
        }
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("Error registering user:", error);
        setSnackbarMessage("Error registering user: " + error.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleBackToLogin = () => {
    navigate("/LoginForm"); // Adjust the path as needed
  };

  return (
    <Container>
      <HeaderForLogin />
      <div className="register-form-container" style={{ marginTop: "80px" }}>
        <img src={amodocs} alt="Logo" className="login-logo" />
        <Typography variant="h4" gutterBottom align="center">
          Registration Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Name"
                name="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="NTNET ID"
                name="ntnet"
                value={formData.ntnet}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleRegionChange}
                fullWidth
                variant="outlined"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) =>
                    selected.map((region) => region.region_name).join(", "),
                }}
                required
              >
                {regions.map((region) => (
                  <MenuItem key={region.region_id} value={region}>
                    <Checkbox
                      checked={formData.region.some(
                        (selectedRegion) =>
                          selectedRegion.region_id === region.region_id
                      )}
                    />
                    <ListItemText primary={region.region_name} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Account"
                name="account"
                value={formData.account}
                onChange={handleAccountChange}
                fullWidth
                variant="outlined"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) =>
                    selected.map((account) => account.account_name).join(", "),
                }}
                required
              >
                {accounts.map((account) => (
                  <MenuItem key={account.account_id} value={account}>
                    <Checkbox
                      checked={formData.account.some(
                        (selectedAccount) =>
                          selectedAccount.account_id === account.account_id
                      )}
                    />
                    <ListItemText primary={account.account_name} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ width: "400px" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%", fontSize: "1.2rem", padding: "20px" }}
          >
            {snackbarMessage}
            {snackbarSeverity === "success" && (
              <Button color="inherit" size="small" onClick={handleBackToLogin}>
                Back to Login
              </Button>
            )}
          </Alert>
        </Snackbar>
      </div>
    </Container>
  );
};

export default RegistrationForm;
