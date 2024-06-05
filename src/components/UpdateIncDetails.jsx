import React, { useState, useEffect } from 'react';
  import { useParams,useNavigate, Navigate } from 'react-router-dom';
import { Container, Typography, Grid, TextField, Button, MenuItem, IconButton,Box } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import Header from './Header';
import QRCode from "qrcode.react";
import Paper from '@mui/material/Paper';
import FileCopyIcon from '@mui/icons-material/FileCopy'; // Importing copy icon
import { makeStyles } from '@mui/styles';
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Importing from @mui/icons-material
import { format } from "date-fns";


const useStyles = makeStyles(() => ({
  paper: {
    padding: '16px', // Adjust this value as needed
    margin: 'auto',
    marginTop: '32px', // Adjust this value as needed
    maxWidth: 1000,
  },
}));

const UpdateIncDetails = () => {
  const classes = useStyles();
  const { id } = useParams(); // Get the incident ID from URL params
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const [copied, setCopied] = useState(false); 
  const [formData, setFormData] = useState({

    manager: '',
    workAround: '',
    businessImpact: '',
    bridgeDetails: '',
    priority: '',
    issueOwnedBy: '',
    nextUpdate: '',
    preUpdates: [],
    incNumber: '',
    account: '',
    status: '',
    statusforfileds:'',
    date:'',
    time:'',
    problemStatement: ""
  });
  const [updateForm, SetUpdateForm] = useState(true);
  const [whatsAppAndCopy, SetWhatsAppAndCopy] = useState(false);
  const [isIncidentEmpty, setIsIncidentEmpty] = useState(false);
  const [managersForAccount, setManagersForAccount] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [dateForSubmit,setDateForSubmit] = useState(null);
  const [timeForSubmit, setTimeForSubmit] = useState(null);
  const dataForWhatAppandCopy = ("*Below are Details for raised INC*" + "\n" + 
  "*priority*:-"+formData.priority +
  "\n*Account* :-"+formData.account+
  "\n*IncNumber*:- " + formData.incNumber +
  "\n*Status*:-" + formData.status +
  "\n*Description/Problem Satatement*:-" + formData.problemStatement +
  "\n*Business impact*:-"+formData.businessImpact+
  "\n*Work Around*:-"+formData.workAround  +
  "\n*Date*:-"+ formData.date+
  "\n*Time*:-"+ formData.time+
  "\n"+"*Status Update/Next Step*:-" + formData.nextUpdate+
  "\n*Previous Update*:-\n" + formData.preUpdates.map(update => `${update.timestamp} -- ${update.message}`).join("\n")+
  "\n"+"*bridgeDetails*:-" + formData.bridgeDetails 
  ); 



useEffect(() => {
  const fetchIncidentDetails = async () => {
    try {
      const response = await axios.get(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/incDetails/${id}`);
      if (response.status === 200) {
        const incidentData = response.data;
        if (incidentData.length === 0) {
          setIsIncidentEmpty(true);
        } else {
          setFormData({
            manager: incidentData?.[0]?.manager,
            workAround: incidentData?.[0]?.workAround,
            businessImpact: incidentData?.[0]?.businessImpact,
            bridgeDetails: incidentData?.[0]?.bridgeDetails,
            priority: incidentData?.[0]?.priority,
            issueOwnedBy: incidentData?.[0]?.issueOwnedBy,
            preUpdates: incidentData?.[0]?.preUpdates,
            incNumber: incidentData?.[0]?.incNumber,
            account: incidentData?.[0]?.account,
            status: incidentData?.[0]?.status,
            statusforfileds: incidentData?.[0]?.status,
            date: format(new Date(), "yyyy-MM-dd"), // Set initial value to today's date
            time: format(new Date(), "HH:mm"), // Set initial value to current time
            problemStatement: incidentData?.[0]?.problemStatement,
          });
          setDateForSubmit(incidentData?.[0]?.date.toLocaleString());
          setTimeForSubmit(incidentData?.[0]?.time);
          try {
            const response = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/managerForAccount/${incidentData?.[0]?.account}`);
            if (response.ok) {
              console.log("response from managerfor account"+ response);
              const dataforManager = await response.json();
              setManagersForAccount(dataforManager?.[0]?.managers);
            } else {
              console.error('Failed to fetch managers:', response.statusText);
            }
          } catch (error) {
            console.error('Error occurred while fetching managers:', error);
          }
        }
      } else {
        console.error('Failed to fetch incident details');
      }
    } catch (error) {
      console.error('Error occurred while fetching incident details:', error);
    }
  };

  fetchIncidentDetails();
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  
  

   // Function to generate WhatsApp message link
   const generateWhatsAppLink = () => {
    // Construct your WhatsApp message link with the phone number and data
    
     const phoneNumber = userDetails?.mobNumber ?? '7772980155'; 
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(dataForWhatAppandCopy)}`;
  };

  const whatsappLink = generateWhatsAppLink();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      

    const updatedStatusUpdate = {
      timestamp: `${formData.date} ${formData.time}`, // Combine date and time
      message: formData.nextUpdate
    };

   
       // Create an array with the updated status update and existing preUpdates
       const updatedPreStatusUpdates = [updatedStatusUpdate, ...formData.preUpdates];
   
       // Update formData with the new preUpdates
       const updatedFormData = {
         ...formData,
         preUpdates: updatedPreStatusUpdates
       };
   
      const response = await axios.post(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/saveInc`, updatedFormData);
      if (response.status === 200) {
        console.log('Incident details updated successfully');
        // Redirect or display a success message
        setSubmittedData(updatedFormData); // Set submitted data
        SetUpdateForm(false);
        SetWhatsAppAndCopy(true);
      } else {
        console.error('Failed to update incident details');
      }
    } catch (error) {
      console.error('Error occurred while updating incident details:', error);
    }

  };

  const handleClose = () => {
    navigate("/IncidentsList");
   
  };

 
  
// Redirect to login if not authenticated
if (!isAuthenticated) {
  return <Navigate to="/LoginForm" />;
}

  if (isIncidentEmpty) {
    return (
      <div>

      <Header />
      <Paper elevation={3} className={classes.paper}>
    <Container maxWidth="md" className="incident-container" >
       
        <Typography variant="h5" gutterBottom>
          No such incident found.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClose}>
          Go to Incidents List
        </Button>
     </Container>
     </Paper>
     </div>
    );
  }

 

  const detailsToCopy = submittedData ? `
  *Priority*:- ${submittedData.priority}
  *Account*: ${submittedData.account}
  *Incident Number*:-  ${id}
  *Status*:- ${submittedData.status}
  *Description/Problem Statement*:- ${submittedData.problemStatement}
  *Business Impact*:- ${submittedData.businessImpact}
  *Workaround*:- ${submittedData.workAround}
  *Date*:- ${submittedData.date}
  *Time*:- ${submittedData.time}
  *Status Update/Next Step*:- ${submittedData.nextUpdate}
  *Previous Update*:- 
   ${formData.preUpdates.map(update => `${update.timestamp} -- ${update.message}`).join('\n   ')}
  *Bridge Details*:- ${submittedData.bridgeDetails}
` : '';

  
const handleCopy = () => {
  // Define the text to copy
  

  if (!detailsToCopy) {
    console.error('No details to copy');
    return;
  }

  // Check if the Clipboard API is available and the context is secure
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(detailsToCopy)
      .then(() => {
        console.log('Incident details copied to clipboard');
        setCopied(true);
        // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      })
      .catch((error) => {
        console.error('Error copying incident details to clipboard using Clipboard API:', error);
      });
  } else {
    // Fallback method for non-secure contexts or unsupported browsers
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = detailsToCopy;
    document.body.appendChild(textarea);

    // Select the text in the textarea
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    try {
      // Copy the text to the clipboard
      document.execCommand('copy');
      console.log('Incident details copied to clipboard using fallback method');
      setCopied(true);
      // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Error copying incident details to clipboard using fallback method:', error);
    }

    // Remove the temporary textarea element
    document.body.removeChild(textarea);
  }
};


  return (
    <div>

            <Header />
            <Paper elevation={3} className={classes.paper}>
    <Container maxWidth="md" className="incident-container" >
    
    {updateForm && (<div>
      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
  <Typography variant="h5" gutterBottom  style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', margin : '0' }}>
    Incident Details
  </Typography>
  <IconButton color="inherit" onClick={handleClose} style={{ width: '5%' }}>
    <CloseIcon />
  </IconButton>
</Box>
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField name="incNumber" label="Inc Number" value={formData.incNumber} onChange={handleChange} fullWidth disabled 
           required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            fullWidth
            InputProps={{
              readOnly: true, // Make the TextField read-only
            }}
        >

          
        
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
            InputProps={{
              readOnly: formData.statusforfileds === 'Closed',
            }}
          >
            <MenuItem value="P1">P1</MenuItem>
            <MenuItem value="P2">P2</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Add Status Update"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            InputProps={{
              readOnly: formData.statusforfileds === 'Closed',
            }}
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
                    <TextField
                      name="problemStatement"
                      label="Problem Statement"
                      value={formData.problemStatement}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
                      required
                      InputProps={{
                        readOnly: formData.statusforfileds === 'Closed',
                      }}
                    />
                  </Grid>
        
                  <Grid item xs={12}>
  {formData.statusforfileds !== 'Closed' && (
    <TextField 
      name="nextUpdate" 
      label="Status Update/Next Step" 
      value={formData.nextUpdate} 
      onChange={handleChange} 
      fullWidth 
      multiline 
      rows={2}
      required
      InputProps={{
        readOnly: formData.statusforfileds === 'Closed',
      }}
    />
  )}
</Grid>

        
        <Grid item xs={12} sm={6}>
        <TextField
    select
    label="Notification Manager"
    name="manager"
    value={formData.manager}
    onChange={handleChange}
    fullWidth
    error={!formData.manager && managersForAccount.length > 0} // Added error handling
    helperText={!formData.manager && managersForAccount.length > 0 ? 'Please select a manager' : ''} // Added helper text
    InputProps={{
      readOnly: formData.statusforfileds === 'Closed',
    }}
  >
    {Array.isArray(managersForAccount) && managersForAccount.map((manager) => (
      <MenuItem key={manager?.name} value={manager?.name}>
        {manager?.name}
      </MenuItem>
    ))}
  </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Issue Owned By"
            name="issueOwnedBy"
            value={formData.issueOwnedBy}
            onChange={handleChange}
            fullWidth
            InputProps={{
              readOnly: true, // Make the TextField read-only
            }}
        >
        
          </TextField>
        </Grid>
         {/* start time */}
        { formData.statusforfileds !== 'Closed' && (
        <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={formData.statusforfileds === 'Closed'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                   )}
                   { formData.statusforfileds !== 'Closed' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={formData.statusforfileds === 'Closed'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 minute intervals
                      }}
                    />
                  </Grid> )}
                  

                  { formData.statusforfileds === 'Closed' && (
        <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date"
                      type="date"
                      name="dateForSubmit"
                      value={dateForSubmit}

                      fullWidth
                      required
                      disabled={formData.statusforfileds === 'Closed'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                   )}
                   { formData.statusforfileds === 'Closed' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Time"
                      type="time"
                      name="timeForSubmit"
                      value={timeForSubmit}
                      
                      fullWidth
                      required
                      disabled={formData.statusforfileds === 'Closed'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 minute intervals
                      }}
                    />
                  </Grid> )}
                 

        <Grid item xs={12}>
          <TextField name="businessImpact" label="Business Impact" value={formData.businessImpact} onChange={handleChange} fullWidth multiline rows={1} 
          InputProps={{
            readOnly: formData.statusforfileds === 'Closed',
          }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField name="workAround" label="workAround" value={formData.workAround} onChange={handleChange} fullWidth multiline rows={1} 
          InputProps={{
            readOnly: formData.statusforfileds === 'Closed',
          }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField name="bridgeDetails" label="Bridge Details" value={formData.bridgeDetails} onChange={handleChange} fullWidth multiline rows={1} 
          InputProps={{
            readOnly: formData.statusforfileds === 'Closed',
          }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField name="preUpdates" label="Pre Status Details" 
          value={formData.preUpdates.map(update => `${update.timestamp} -- ${update.message}`).join("\n")}
          onChange={handleChange} fullWidth multiline rows={2} 
          InputProps={{
            readOnly: true, // Make the TextField read-only
          }}
          />
        </Grid>
       
         {formData.statusforfileds !== 'Closed' && (       
        <Grid item xs={3}>
          <Button variant="contained" color="primary" type="submit">
            Update Details
          </Button>
        </Grid>)}
      </Grid>
    </form>
    </div> )}
   
    {whatsAppAndCopy && (
  <Container maxWidth="md" style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '16px', marginTop: '20px' }}>
     
   <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="h5" gutterBottom style={{ width: '95%', textAlign: 'left' }}>
        Scan QR for sending details to WhatsApp
      </Typography>
      <IconButton color="inherit" onClick={handleClose} style={{ width: '5%' }}>
        <CloseIcon />
      </IconButton>
    </Box>
     {/* Add space between the text and QRCode */}
     <Box mb={2} />
    {/* Call the WhatsAppQRCode component with the phoneNumber and data props */}
    <QRCode value={whatsappLink} />
  </Container>
)}


{submittedData && (
  <Container maxWidth="md" style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '16px', marginTop: '20px' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Typography variant="h5" gutterBottom style={{ width: '90%', textAlign: 'left'}}>
        Submitted Incident Details
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        {!copied ? (
          <Button
            variant="outlined"
            color="inherit"
            style={{ width: "10%" }}
            onClick={handleCopy}
            title="Copy"
          >
            <FileCopyIcon />
          </Button>
        ) : (
          <CheckCircleIcon sx={{ color: "green" }} />
        )}
        {copied && (
          <div style={{ marginLeft: "10px", fontStyle: "italic", color: "#666", whiteSpace: 'nowrap' }}>
            Copied:{" "}
            <span style={{ fontWeight: "bold" }}>incident details</span>
          </div>
        )}
      </div>
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

export default UpdateIncDetails;
