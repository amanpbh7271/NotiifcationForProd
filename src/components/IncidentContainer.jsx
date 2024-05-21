import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Button, MenuItem, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {  useNavigate, Navigate } from 'react-router-dom';
import Header from './Header';
import QRCode from "qrcode.react";
import FileCopyIcon from '@mui/icons-material/FileCopy'; // Importing copy icon
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  paper: {
    padding: '16px', // Adjust this value as needed
    margin: 'auto',
    marginTop: '32px', // Adjust this value as needed
    maxWidth: 1000,
  },
}));

const IncidentContainer = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    incNumber: '',
    account: '',
    status: '',
    addStatusUpdate: '',
    businessImpact: '',
    workAround: '',
    manager: '',
    issueOwnedBy: '',
    bridgeDetails: '',
    priority: ''
  });
  const [incForm, setIncForm] = useState(true);
  const [accountOptions, setAccountOptions] = useState([]);
  const [managersForAccount, setManagersForAccount] = useState([]);
  const userDetails = JSON.parse(localStorage.getItem('userDetails')); 
  const [whatsAppAndCopy, SetWhatsAppAndCopy] = useState(false);
  const [date, SetDate] = useState('');
  const [time, SetTime] = useState('');
  const [whatsappLink, setWhatsAppLink] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    // Get current date and time
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toISOString().split('T')[0]; // Extract date part
    const currentTimeFormatted = currentDate.toLocaleTimeString(); // Extract time part

    // Create pre-updates object
    const preUpdates = [{
      timestamp: `${currentDateFormatted} ${currentTimeFormatted}`,
      message: formData.addStatusUpdate // Assuming statusUpdate is the message
    }];
    SetDate(currentDateFormatted);
    SetTime(currentTimeFormatted);

    // Include pre-updates along with other form data
    const formDataWithDateTimeAndPreUpdates = {
      ...formData,
      date: currentDateFormatted, // Add current date
      time: currentTimeFormatted, // Add current time
      preUpdates: preUpdates, // Add pre-updates
      nextUpdate: formData.addStatusUpdate
    };

    event.preventDefault();
    try {
      const response = await fetch('http://inpnqsmrtop01:9090/demo-0.0.1-SNAPSHOT/api/saveInc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataWithDateTimeAndPreUpdates)
      });
      if (response.ok) {
        console.log('Incident data saved successfully');
        // Reset form after successful submission if needed
        setIncForm(false);
        SetWhatsAppAndCopy(true);
        setSubmittedData(formDataWithDateTimeAndPreUpdates); // Set submitted data
      } else {
        console.error('Failed to save incident data');
      }
    } catch (error) {
      console.error('Error occurred while saving incident data:', error);
    }
  };

  useEffect(() => {
    // Fetch managers when account changes
    const fetchManagers = async () => {
      try {
        const response = await fetch(`http://inpnqsmrtop01:9090/demo-0.0.1-SNAPSHOT/api/managerForAccount/${formData.account}`);
        if (response.ok) {
          const dataforManager = await response.json();
          setManagersForAccount(dataforManager[0]?.managers);
          console.log("managersForAccount"+managersForAccount);
        } else {
          console.error('Failed to fetch managers:', response.statusText);
        }
      } catch (error) {
        console.error('Error occurred while fetching managers:', error);
      }
    };

    fetchManagers();
  }, [formData.account]);

  useEffect(() => {
    // Fetch account options for the user "Amar"
    const fetchAccountOptionsForUser = async () => {
      try {
        const userNameForApi = userDetails.username;

        const response = await fetch(`http://inpnqsmrtop01:9090/demo-0.0.1-SNAPSHOT/api/accountForUser/${userNameForApi}`);
        if (response.ok) {
          const accountData = await response.json();
          // Extract account options from the response and update state

          setAccountOptions(accountData);
          console.log("account"+accountData);
        } else {
          console.error('Failed to fetch account options:', response.statusText);
        }
      } catch (error) {
        console.error('Error occurred while fetching account options:', error);
      }
    };

    fetchAccountOptionsForUser();
  }, []);

  useEffect(() => {
    // Generate WhatsApp link
    const generateWhatsAppLink = () => {
      // Construct your WhatsApp message link with the phone number and data
      //const  = 7772980155; // Replace with your phone number
      const phoneNumber = userDetails?.mobNumber ?? '7772980155'; 

      const dataForWhatsApp = ("*Below are Details for raised INC*" + "\n" + "*IncNumber*:- " + formData.incNumber + "\n*Account* :-" + formData.account +
        "\n*Updated/next Status*:-\n" + formData.addStatusUpdate +
        "\n*Status*:-" + formData.status +
        "\n*Business impact*:-" + formData.businessImpact + "\n*Work Around*:-" + formData.workAround +
        "\n*Notification Manager*:-" + formData.manager + "\n*Issue Owned By*:-" + formData.issueOwnedBy +
        "\n" + "*bridgeDetails*:-" + formData.bridgeDetails + "\n*Date*:-" + date + "\n*Time*:-" + time +
        "\n*priority*:-" + formData.priority
      );
      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(dataForWhatsApp)}`;
    };

    setWhatsAppLink(generateWhatsAppLink());
  }, [formData, date, time]);

  const handleClose = () => {
    navigate("/IncidentsList");
  };

  const detailsToCopy = `
  Incident Number: ${submittedData?.incNumber || ''}
  Account: ${submittedData?.account || ''}
  Status: ${submittedData?.status || ''}
  Status Update/Next Step: ${submittedData?.addStatusUpdate || ''}
  Business Impact: ${submittedData?.businessImpact || ''}
  Workaround: ${submittedData?.workAround || ''}
  Notification Manager: ${submittedData?.manager || ''}
  Issue Owned By: ${submittedData?.issueOwnedBy || ''}
  Bridge Details: ${submittedData?.bridgeDetails || ''}
  Date: ${submittedData?.date || ''}
  Time: ${submittedData?.time || ''}
  Priority: ${submittedData?.priority || ''}
  `;
  

  const handleCopy = () => {
    // Construct the text to copy
    

    // Copy the text to clipboard
    navigator.clipboard.writeText(detailsToCopy)
      .then(() => console.log('Incident details copied to clipboard'))
      .catch((error) => console.error('Error copying incident details to clipboard:', error));
  };

  const isAuthenticated = localStorage.getItem('token');
  console.log("isAuthenticated" ,isAuthenticated);
 
if (!isAuthenticated) {
  console.log("hadslasd");
   return <Navigate to="/" />;
 }

  return (
    <div>
      <Header />
      <Paper elevation={3} className={classes.paper}>
      <Container maxWidth="md" className="incident-container" >
        {incForm && (
          <div>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" gutterBottom style={{ width: '95%' }}>
                Please Enter Incident Details
              </Typography>
              <IconButton color="inherit" onClick={handleClose} style={{ width: '5%' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="incNumber" label="Inc Number" value={formData.incNumber} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Account"
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    {accountOptions?.map((option) => (
  <MenuItem key={option?.name} value={option?.name}>
    {option?.name}
  </MenuItem>
))}

                
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField name="addStatusUpdate" label="Status Update/Next Step" value={formData.addStatusUpdate} onChange={handleChange} fullWidth multiline rows={1} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="Open">Open</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="P1">P1</MenuItem>
                    <MenuItem value="P2">P2</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Notification Manager"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    {managersForAccount?.map((manager) => (
  <MenuItem key={manager?.name} value={manager?.name}>
    {manager?.name}
  </MenuItem>
))}

               
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Issue Owned By"
                    name="issueOwnedBy"
                    value={formData.issueOwnedBy}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="Amdocs">Amdocs</MenuItem>
                    <MenuItem value="TechM">TechM</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField name="businessImpact" label="Business Impact" value={formData.businessImpact} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="workAround" label="Work Around" value={formData.workAround} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="bridgeDetails" label="Bridge Details" value={formData.bridgeDetails} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={3}>
                  <Button variant="contained" color="primary" type="submit">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        )}
        {whatsAppAndCopy && (
          <div>
          <Container maxWidth="md" style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '16px', marginTop: '20px' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" gutterBottom style={{ width: '95%' }}>
                Scan QR for sending details to WhatsApp
              </Typography>
              <IconButton color="inherit" onClick={handleClose} style={{ width: '5%' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            {/* Call the WhatsAppQRCode component with the phoneNumber and data props */}
            <QRCode value={whatsappLink} />
          </Container>
        </div>
        
        )}

{submittedData && (
  <Container maxWidth="md" style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '16px', marginTop: '20px' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h5" gutterBottom style={{ width: '95%' }}>
        Submitted Incident Details
      </Typography>
      <Button variant="outlined" color="inherit" style={{ width: '5%' }} onClick={handleCopy}>
        <FileCopyIcon />
      </Button>
    </Box>
    <Container maxWidth="md">
      <Typography variant="body1" gutterBottom>
        <pre style={{ textAlign: 'left' }}>
          {detailsToCopy}
        </pre>
      </Typography>
    </Container>
  </Container>
)}



      </Container>
      </Paper>
    </div>
  );
};

export default IncidentContainer;
