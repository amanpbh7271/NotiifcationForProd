import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { format, toZonedTime,toDate } from 'date-fns-tz';
import { differenceInMinutes } from 'date-fns';

import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import Header from "./Header";
import QRCode from "qrcode.react";
import Paper from "@mui/material/Paper";
import FileCopyIcon from "@mui/icons-material/FileCopy"; // Importing copy icon
import { makeStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Importing from @mui/icons-material

const useStyles = makeStyles(() => ({
  paper: {
    padding: "16px", // Adjust this value as needed
    margin: "auto",
    marginTop: "32px", // Adjust this value as needed
    maxWidth: 1000,
  },
}));

const UpdateIncDetails = () => {
  const classes = useStyles();
  const { id } = useParams(); // Get the incident ID from URL params
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token");
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    manager: "",
    workAround: "",
    businessImpact: "",
    bridgeDetails: "",
    priority: "",
    issueOwnedBy: "",
    nextUpdate: "",
    preUpdates: [],
    incNumber: "",
    region: "",
    account: "",
    status: "",
    rootCause: "",
    statusforfileds: "",
    date: "",
    time: "",
    problemStatement: "",
    impactStartDate: "",
    impactStartTime: "",
    impactEndDate: "",
    impactEndTime: "",
    minutesOfOutage: "",
    affectedServices: "", // New field
    problemIdentified: "", // New field
    escalatedLevel: "", // New field
    expertsContacted: "", // New field
    updateFrequency: "", // New field
    checkedWithOtherAccounts: "", // New field
    coreExpertsInvolved: "", // New field
    etaForResolution: "", // New field
  });

  const [updateForm, SetUpdateForm] = useState(true);
  const [whatsAppAndCopy, SetWhatsAppAndCopy] = useState(false);
  const [isIncidentEmpty, setIsIncidentEmpty] = useState(false);
  const [managersForAccount, setManagersForAccount] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [dataForWhatAppandCopy, setDataForWhatAppandCopy] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newIncNumber, setNewIncNumber] = useState("");
  const [whatsAppAndCopyAfterIncClose, setWhatsAppAndCopyAfterIncClose] =
    useState(false);
  const [
    dataForWhatAppandCopyAfterIncCLosed,
    setDataForWhatAppandCopyIncClosed,
  ] = useState(false);


 
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        const response = await axios.get(
          `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/incDetails/${id}`
        );
        if (response.status === 200) {
          const incidentData = response.data;
          if (incidentData.length === 0) {
            setIsIncidentEmpty(true);
          } else {

            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get system's local time zone

// Convert UTC to local time if values are not null
const impactStartDateTime = incidentData?.[0]?.impactStartDate && incidentData?.[0]?.impactStartTime
  ? format(toZonedTime(new Date(`${incidentData[0].impactStartDate}T${incidentData[0].impactStartTime}Z`), timeZone), 'yyyy-MM-dd HH:mm')
  : '';
const impactEndDateTime = incidentData?.[0]?.impactEndDate && incidentData?.[0]?.impactEndTime
  ? format(toZonedTime(new Date(`${incidentData[0].impactEndDate}T${incidentData[0].impactEndTime}Z`), timeZone), 'yyyy-MM-dd HH:mm')
  : '';

// Split the combined date and time into separate date and time variables
const [impactStartDate, impactStartTime] = impactStartDateTime ? impactStartDateTime.split(' ') : ['', ''];
const [impactEndDate, impactEndTime] = impactEndDateTime ? impactEndDateTime.split(' ') : ['', ''];


  
            // Convert preUpdates timestamps to local time
            const preUpdates = incidentData?.[0]?.preUpdates.map((update) => ({
              ...update,
              timestamp: format(toZonedTime(new Date(update.timestamp), timeZone), 'yyyy-MM-dd HH:mm'),
            }));
         
            setFormData({
              manager: incidentData?.[0]?.manager,
              workAround: incidentData?.[0]?.workAround,
              businessImpact: incidentData?.[0]?.businessImpact,
              bridgeDetails: incidentData?.[0]?.bridgeDetails,
              priority: incidentData?.[0]?.priority,
              issueOwnedBy: incidentData?.[0]?.issueOwnedBy,
              preUpdates: preUpdates,
              incNumber: incidentData?.[0]?.incNumber,
              region: incidentData?.[0]?.region,
              account: incidentData?.[0]?.account,
              status: incidentData?.[0]?.status,
              statusforfileds: incidentData?.[0]?.status,
              date: format(new Date(), 'yyyy-MM-dd'), // Set initial value to today's date
              time: format(new Date(), 'HH:mm'), // Set initial value to current time
              problemStatement: incidentData?.[0]?.problemStatement,
              impactStartDate: impactStartDate,
              impactStartTime: impactStartTime,
              impactEndDate: impactEndDate,
              impactEndTime: impactEndTime,
              minutesOfOutage: incidentData?.[0]?.minutesOfOutage ?? '',
              rootCause: incidentData?.[0]?.rootCause ?? '',
              affectedServices: incidentData?.[0]?.affectedServices ?? '', // New field
              problemIdentified: incidentData?.[0]?.problemIdentified ?? '', // New field
              escalatedLevel: incidentData?.[0]?.escalatedLevel ?? '', // New field
              expertsContacted: incidentData?.[0]?.expertsContacted ?? '', // New field
              updateFrequency: incidentData?.[0]?.updateFrequency ?? '', // New field
              checkedWithOtherAccounts: incidentData?.[0]?.checkedWithOtherAccounts ?? '', // New field
              coreExpertsInvolved: incidentData?.[0]?.coreExpertsInvolved ?? '', // New field
              etaForResolution: incidentData?.[0]?.etaForResolution ?? '', // New field
            });
  
            // Fetch managers for the account
            try {
              const response = await fetch(
                `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/managerForAccounts/${incidentData?.[0]?.account}`
              );
              if (response.ok) {
                const dataforManager = await response.json();
                setManagersForAccount(dataforManager);
              } else {
                console.error("Failed to fetch managers:", response.statusText);
              }
            } catch (error) {
              console.error("Error occurred while fetching managers:", error);
            }
          }
        } else {
          console.error("Failed to fetch incident details");
        }
      } catch (error) {
        console.error("Error occurred while fetching incident details:", error);
      }
    };
  
    fetchIncidentDetails();
  }, [id]);
  

 
  

  

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value
  //   });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "status") {
      setFormData({
        ...formData,
        [name]: value,
        rootCause: value === "Closed" ? formData.rootCause : "", // Clear Root Cause if not 'Closed'
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Function to generate WhatsApp message link
  const generateWhatsAppLink = () => {
    // Construct your WhatsApp message link with the phone number and data

    const phoneNumber = userDetails?.mobile ?? "7772980155";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      dataForWhatAppandCopy
    )}`;
  };

  const whatsappLink = generateWhatsAppLink();

  // Function to generate WhatsApp message link
  const generateWhatsAppLinkIncClosed = () => {
    // Construct your WhatsApp message link with the phone number and data

    const phoneNumber = userDetails?.mobile ?? "7772980155";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      dataForWhatAppandCopyAfterIncCLosed
    )}`;
  };

  const whatsappLinkAfterIncClosed = generateWhatsAppLinkIncClosed();

 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get system's local time zone
  
      // Convert date and time to UTC
      const zonedDate = new Date(`${formData.date}T${formData.time}`);
      const utcDate = toDate(zonedDate, timeZone);
  
      // Convert impact start date and time to UTC
      const impactStartZonedDate = new Date(`${formData.impactStartDate}T${formData.impactStartTime}`);
      const impactStartUtcDate = toDate(impactStartZonedDate, timeZone);
  
      // Convert preUpdates timestamps to UTC
      const updatedPreStatusUpdates = formData.preUpdates.map((update) => ({
        ...update,
        timestamp: toDate(new Date(update.timestamp), timeZone).toISOString(),
      }));
  
      // Add the new status update
      const updatedStatusUpdate = {
        timestamp: utcDate.toISOString(), // Combine date and time in UTC
        message: formData.nextUpdate,
      };
  
      // Include the new status update in preUpdates
      updatedPreStatusUpdates.unshift(updatedStatusUpdate);
  
      // Update formData with the new preUpdates
      const updatedFormData = {
        ...formData,
        preUpdates: updatedPreStatusUpdates,
        date: utcDate.toISOString().split('T')[0], // Set date in UTC
        time: utcDate.toISOString().split('T')[1].substring(0, 5), // Set time in UTC
        impactStartDate: impactStartUtcDate.toISOString().split('T')[0], // Set impactStartDate in UTC
        impactStartTime: impactStartUtcDate.toISOString().split('T')[1].substring(0, 5), // Set impactStartTime in UTC
        newIncNumber: newIncNumber,
        isEditing: isEditing,
      };

    
  
      // Adjust impactEndDate, impactEndTime, and minutesOfOutage if status is 'Closed'
      if (formData.status === "Closed") {
        // Convert impact end date and time to UTC
        const impactEndZonedDate = new Date(`${formData.date}T${formData.time}`);
        const impactEndUtcDate = toDate(impactEndZonedDate, timeZone);
        updatedFormData.impactEndDate = impactEndUtcDate.toISOString().split('T')[0]; // Set impactEndDate in UTC
        updatedFormData.impactEndTime = impactEndUtcDate.toISOString().split('T')[1].substring(0, 5); // Set impactEndTime in UTC
  
        const startDateTime = new Date(`${updatedFormData.impactStartDate}T${updatedFormData.impactStartTime}`);
        const endDateTime = new Date(`${updatedFormData.impactEndDate}T${updatedFormData.impactEndTime}`);
        const minutesOfOutage = differenceInMinutes(endDateTime, startDateTime); // Calculate total minutes of outage
  
        updatedFormData.minutesOfOutage = isNaN(minutesOfOutage) ? "" : minutesOfOutage; // Set minutesOfOutage or empty if calculation fails
      }
  

      
        const response = await axios.post(
          `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/saveInc`,
          updatedFormData
        );
        if (response.status === 200) {

          
          const impactStartDateTimeAfterSubmit = updatedFormData?.impactStartDate && updatedFormData?.impactStartTime
  ? format(toZonedTime(new Date(`${updatedFormData.impactStartDate}T${updatedFormData.impactStartTime}Z`), timeZone), 'yyyy-MM-dd HH:mm')
  : '';
const [impactStartDateAfterSubmit, impactStartTimeAfterSubmit] = impactStartDateTimeAfterSubmit ? impactStartDateTimeAfterSubmit.split(' ') : ['', ''];

const impactEndDateTime = updatedFormData?.impactEndDate && updatedFormData?.impactEndTime
  ? format(toZonedTime(new Date(`${updatedFormData.impactEndDate}T${updatedFormData.impactEndTime}Z`), timeZone), 'yyyy-MM-dd HH:mm')
  : '';
const [impactEndDate, impactEndTime] = impactEndDateTime ? impactEndDateTime.split(' ') : ['', ''];

      
const dateAfterSubmit = updatedFormData?.date && updatedFormData?.time
  ? format(toZonedTime(new Date(`${updatedFormData.date}T${updatedFormData.time}Z`), timeZone), 'yyyy-MM-dd HH:mm')
  : '';
const [dateAfterSubmitDate, dateAfterSubmitTime] = dateAfterSubmit ? dateAfterSubmit.split(' ') : ['', ''];

const updatedFormUpdatedData = {
  ...updatedFormData,
  date: dateAfterSubmitDate,
  time: dateAfterSubmitTime,
  impactStartDate: impactStartDateAfterSubmit, // Set impactStartDate in local time zone
  impactStartTime: impactStartTimeAfterSubmit, // Set impactStartTime in local time zone
  impactEndDate: impactEndDate, // Set impactEndDate in local time zone
  impactEndTime: impactEndTime, // Set impactEndTime in local time zone
};

setSubmittedData(updatedFormUpdatedData); // Set submitted data

          // Update the WhatsApp and copy details
          const updatedWhatsAppAndCopy = `
          ${
            updatedFormData.status === "Closed"
              ? "*Below are Final Details for raised INC*"
              : "*Below are Details for raised INC*"
          }
          *Priority*:- ${updatedFormData.priority}
          *Region*:- ${updatedFormData.region}
          *Account*:- ${updatedFormData.account}
          *Incident Number*:- ${
            isEditing ? updatedFormData.newIncNumber : updatedFormData.incNumber
          }
          *Status*:- ${updatedFormData.status}
          *Description/Problem Statement*:- ${updatedFormData.problemStatement}
          *Business Impact*:- ${updatedFormData.businessImpact}
          *Work Around*:- ${updatedFormData.workAround}
          *Date*:- ${dateAfterSubmitDate}
          *Time*:- ${dateAfterSubmitTime}
          *Status Update/Next Step*:- ${updatedFormData.nextUpdate}
          *Previous Update*:-\\n${updatedFormData.preUpdates
            .map((update) => `   ${format(toZonedTime(new Date(update.timestamp), timeZone), 'yyyy-MM-dd HH:mm')} -- ${update.message}`)
            .join("\\n")}
          *Bridge Details*:- ${updatedFormData.bridgeDetails}
          
          *Impact Start Date*:- ${impactStartDateAfterSubmit}
          *Impact Start Time*:- ${impactStartTimeAfterSubmit}
          ${
            updatedFormData.status === "Closed"
              ? `
          *Impact End Date*:- ${impactEndDate}
          *Impact End Time*:- ${impactEndTime}
          *Minutes of Outage*:- ${updatedFormData.minutesOfOutage}
          *Root Cause*:- ${updatedFormData.rootCause}`
              : ""
          }
          *Affected Services*:- ${updatedFormData.affectedServices}
          *Problem Identified*:- ${updatedFormData.problemIdentified}
          *Escalated Level*:- ${updatedFormData.escalatedLevel}
          *Experts Contacted*:- ${updatedFormData.expertsContacted}
          *Update Frequency In Mins*:- ${updatedFormData.updateFrequency}
          *Checked With Other Accounts*:- ${
            updatedFormData.checkedWithOtherAccounts
          }
          *Core Experts Involved*:- ${updatedFormData.coreExpertsInvolved}
          *ETA For Resolution*:- ${updatedFormData.etaForResolution}
          `;
      
          setDataForWhatAppandCopy(updatedWhatsAppAndCopy);
          

          SetUpdateForm(false);
          SetWhatsAppAndCopy(true);
        } else {
          console.error("Failed to update incident details");
        }
      } catch (error) {
        console.error("Error occurred while updating incident details:", error);
      }
      
    }
  
  
  
  



  const handleClose = () => {
    navigate("/IncidentsList");
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setNewIncNumber(e.target.value);
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
          <Container maxWidth="md" className="incident-container">
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



  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get system's local time zone

const detailsToCopy = submittedData
  ? `
  *Priority*:- ${submittedData.priority || ""}
  *Region*: ${submittedData.region || ""}
  *Account*: ${submittedData.account || ""}
  *Incident Number*:- ${
    isEditing ? submittedData.newIncNumber : submittedData.incNumber
  }
  *Status*:- ${submittedData.status || ""}
  *Description/Problem Statement*:- ${submittedData.problemStatement || ""}
  *Business Impact*:- ${submittedData.businessImpact || ""}
  *Workaround*:- ${submittedData.workAround || ""}
  *Date*:- ${submittedData.date || ""}
  *Time*:- ${submittedData.time || ""}
  *Status Update/Next Step*:- ${submittedData.nextUpdate || ""}
  *Previous Update*:- 
   ${submittedData.preUpdates
     .map((update) => `${format(toZonedTime(new Date(update.timestamp), timeZone), 'yyyy-MM-dd HH:mm')} -- ${update.message}`)
     .join("\n   ")}
  *Bridge Details*:- ${submittedData.bridgeDetails || ""}
  *Impact Start Date*:- ${submittedData.impactStartDate || ""}
  *Impact Start Time*:- ${submittedData.impactStartTime || ""}
  ${
    submittedData.status === "Closed"
      ? `
  *Impact End Date*:- ${format(toZonedTime(new Date(submittedData.impactEndDate), timeZone), 'yyyy-MM-dd') || ""}
  *Impact End Time*:- ${format(toZonedTime(new Date(`1970-01-01T${submittedData.impactEndTime}`), timeZone), 'HH:mm') || ""}
  *Minutes of Outage*:- ${submittedData.minutesOfOutage || ""}
  *Root Cause*:- ${submittedData.rootCause || ""}`
      : ""
  }
  *Affected Services*:- ${submittedData.affectedServices || ""}
  *Problem Identified*:- ${submittedData.problemIdentified || ""}
  *Escalated Level*:- ${submittedData.escalatedLevel || ""}
  *Experts Contacted*:- ${submittedData.expertsContacted || ""}
  *Update Frequency In Mins*:- ${submittedData.updateFrequency || ""}
  *Checked With Other Accounts*:- ${
    submittedData.checkedWithOtherAccounts || ""
  }
  *Core Experts Involved*:- ${submittedData.coreExpertsInvolved || ""}
  *ETA For Resolution*:- ${submittedData.etaForResolution || ""}
`
  : "";

const handleCopyAfterIncClose = () => {
  SetUpdateForm(false);
  setWhatsAppAndCopyAfterIncClose(true);

  const updatedWhatsAppAndCopyAfterIncClose = `
  ${
    formData.status === "Closed"
      ? "*Below are Final Details for raised INC*"
      : "*Below are Details for raised INC*"
  } 
  *Priority*:- ${formData.priority}
  *Region*:- ${formData.region}
  *Account*:- ${formData.account}
  *Incident Number*:- ${formData.incNumber}
  *Status*:- ${formData.status}
  *Description/Problem Statement*:- ${formData.problemStatement}
  *Business Impact*:- ${formData.businessImpact}
  *Work Around*:- ${formData.workAround}
  *Date*:- ${format(toZonedTime(new Date(formData.impactEndDate), timeZone), 'yyyy-MM-dd')}
  *Time*:- ${format(toZonedTime(new Date(`1970-01-01T${formData.impactEndTime}`), timeZone), 'HH:mm')}
  *Previous Update*:-\n${formData.preUpdates
    .map((update) => `   ${format(toZonedTime(new Date(update.timestamp), timeZone), 'yyyy-MM-dd HH:mm')} -- ${update.message}`)
    .join("\n")}
  *Bridge Details*:- ${formData.bridgeDetails}
  *Impact Start Date*:- ${format(toZonedTime(new Date(formData.impactStartDate), timeZone), 'yyyy-MM-dd')}
  *Impact Start Time*:- ${format(toZonedTime(new Date(`1970-01-01T${formData.impactStartTime}`), timeZone), 'HH:mm')}
  ${
    formData.status === "Closed"
      ? `
  *Impact End Date*:- ${format(toZonedTime(new Date(formData.impactEndDate), timeZone), 'yyyy-MM-dd')}
  *Impact End Time*:- ${format(toZonedTime(new Date(`1970-01-01T${formData.impactEndTime}`), timeZone), 'HH:mm')}
  *Minutes of Outage*:- ${formData.minutesOfOutage}
  *Root Cause*:- ${formData.rootCause}`
      : ""
  }
  *Affected Services*:- ${formData.affectedServices}
  *Problem Identified*:- ${formData.problemIdentified}
  *Escalated Level*:- ${formData.escalatedLevel}
  *Experts Contacted*:- ${formData.expertsContacted}
  *Update Frequency In Mins*:- ${formData.updateFrequency}
  *Checked With Other Accounts*:- ${formData.checkedWithOtherAccounts}
  *Core Experts Involved*:- ${formData.coreExpertsInvolved}
  *ETA For Resolution*:- ${formData.etaForResolution}
  `;

  setDataForWhatAppandCopyIncClosed(updatedWhatsAppAndCopyAfterIncClose);
};


  const handleCopy = () => {
    // Define the text to copy

    if (!detailsToCopy) {
      console.error("No details to copy");
      return;
    }

    // Check if the Clipboard API is available and the context is secure
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(detailsToCopy)
        .then(() => {
          console.log("Incident details copied to clipboard");
          setCopied(true);
          // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        })
        .catch((error) => {
          console.error(
            "Error copying incident details to clipboard using Clipboard API:",
            error
          );
        });
    } else {
      // Fallback method for non-secure contexts or unsupported browsers
      // Create a temporary textarea element
      const textarea = document.createElement("textarea");
      textarea.value = detailsToCopy;
      document.body.appendChild(textarea);

      // Select the text in the textarea
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      try {
        // Copy the text to the clipboard
        document.execCommand("copy");
        console.log(
          "Incident details copied to clipboard using fallback method"
        );
        setCopied(true);
        // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } catch (error) {
        console.error(
          "Error copying incident details to clipboard using fallback method:",
          error
        );
      }

      // Remove the temporary textarea element
      document.body.removeChild(textarea);
    }
  };

  const handleCopyForIncClose = () => {
    // Define the text to copy

    if (!dataForWhatAppandCopyAfterIncCLosed) {
      console.error("No details to copy");
      return;
    }

    // Check if the Clipboard API is available and the context is secure
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(dataForWhatAppandCopyAfterIncCLosed)
        .then(() => {
          console.log("Incident details copied to clipboard");
          setCopied(true);
          // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        })
        .catch((error) => {
          console.error(
            "Error copying incident details to clipboard using Clipboard API:",
            error
          );
        });
    } else {
      // Fallback method for non-secure contexts or unsupported browsers
      // Create a temporary textarea element
      const textarea = document.createElement("textarea");
      textarea.value = dataForWhatAppandCopyAfterIncCLosed;
      document.body.appendChild(textarea);

      // Select the text in the textarea
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      try {
        // Copy the text to the clipboard
        document.execCommand("copy");
        console.log(
          "Incident details copied to clipboard using fallback method"
        );
        setCopied(true);
        // Clear the "Copied" message after a certain duration (e.g., 3 seconds)
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } catch (error) {
        console.error(
          "Error copying incident details to clipboard using fallback method:",
          error
        );
      }

      // Remove the temporary textarea element
      document.body.removeChild(textarea);
    }
  };

  return (
    <div>
      <Header />
      <Paper elevation={3} className={classes.paper}>
        <Container maxWidth="md" className="incident-container">
          {updateForm && (
            <div>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                style={{
                  background: "#f0f0f0",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{
                    background: "#f0f0f0",
                    padding: "10px",
                    borderRadius: "5px",
                    margin: "0",
                  }}
                >
                  Incident Details
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={handleClose}
                  style={{ width: "5%" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                <Grid container spacing={2}>
                  <Grid item sm={9}>
                    {isEditing ? (
                      <TextField
                        label="INC Number"
                        value={newIncNumber}
                        onChange={handleInputChange}
                        fullWidth
                        required
                      />
                    ) : (
                      <TextField
                        label="INC Number"
                        value={formData.incNumber}
                        InputProps={{
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    )}
                  </Grid>

                  {formData.statusforfileds !== "Closed" && (
                    <Grid item sm={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditClick}
                      >
                        Edit INC Number
                      </Button>
                    </Grid>
                  )}
                  {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCopyAfterIncClose}
                        title="Copy to WhatsApp"
                      >
                        Copy Details
                      </Button>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        readOnly: true, // Make the TextField read-only
                      }}
                    ></TextField>
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
                    ></TextField>
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
                        readOnly: formData.statusforfileds === "Closed",
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
                        readOnly: formData.statusforfileds === "Closed",
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
                        readOnly: formData.statusforfileds === "Closed",
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {formData.statusforfileds !== "Closed" && (
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
                          readOnly: formData.statusforfileds === "Closed",
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
                      helperText={
                        !formData.manager && managersForAccount.length > 0
                          ? "Please select a manager"
                          : ""
                      } // Added helper text
                      InputProps={{
                        readOnly: formData.statusforfileds === "Closed",
                      }}
                    >
                      {Array.isArray(managersForAccount) &&
                        managersForAccount.map((manager) => (
                          <MenuItem
                            key={manager?.Manager_Name}
                            value={manager?.Manager_Name}
                          >
                            {manager?.Manager_Name}
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
                    ></TextField>
                  </Grid>
                  {/* start time */}

                  {formData.statusforfileds !== "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        fullWidth
                        required
                        disabled={formData.statusforfileds === "Closed"}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  )}
                  {formData.statusforfileds !== "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Time"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        fullWidth
                        required
                        disabled={formData.statusforfileds === "Closed"}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 minute intervals
                        }}
                      />
                    </Grid>
                  )}

                  {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Impact Start Date"
                        type="date"
                        name="impactStartDate"
                        value={formData.impactStartDate}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: formData.statusforfileds === "Closed",
                        }}
                      />
                    </Grid>
                  )}

                  {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Impact Start Time"
                        type="time"
                        name="impactStartTime"
                        value={formData.impactStartTime}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: formData.statusforfileds === "Closed",
                        }}
                        inputProps={{
                          step: 300, // 5 minute intervals
                        }}
                      />
                    </Grid>
                  )}

                  {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Impact End Date"
                        type="date"
                        name="impactEndDate"
                        value={formData.impactEndDate}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: formData.statusforfileds === "Closed",
                        }}
                      />
                    </Grid>
                  )}

                 {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Impact End Time"
                        type="time"
                        name="impactEndTime"
                        value={formData.impactEndTime}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: formData.statusforfileds === "Closed",
                        }}
                      />
                    </Grid>
                  )}

                  {formData.statusforfileds === "Closed" && (
                    <Grid item xs={12} sm={12}>
                      <TextField
                        label="Minutes of Outage"
                        name="minutesOfOutage"
                        value={formData.minutesOfOutage}
                        fullWidth
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  )}

                  {formData.status === "Closed" && (
                    <Grid item xs={12}>
                      <TextField
                        name="rootCause"
                        label="Root Cause"
                        value={formData.rootCause || ""}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={1}
                        InputProps={{
                          readOnly: formData.statusforfileds === "Closed",
                        }}
                        required
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      name="businessImpact"
                      label="Business Impact"
                      value={formData.businessImpact}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
                      InputProps={{
                        readOnly: formData.statusforfileds === "Closed",
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="workAround"
                      label="workAround"
                      value={formData.workAround}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
                      InputProps={{
                        readOnly: formData.statusforfileds === "Closed",
                      }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="bridgeDetails"
                      label="Bridge Details"
                      value={formData.bridgeDetails}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
                      InputProps={{
                        readOnly: formData.statusforfileds === "Closed",
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="preUpdates"
                      label="Pre Status Details"
                      value={formData.preUpdates
                        .map(
                          (update) => `${update.timestamp} -- ${update.message}`
                        )
                        .join("\n")}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      InputProps={{
                        readOnly: true, // Make the TextField read-only
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="affectedServices"
                      label="Affected Services"
                      value={formData.affectedServices}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      name="problemIdentified"
                      label="Problem Identified"
                      value={formData.problemIdentified}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="escalatedLevel"
                      label="Escalated Level"
                      value={formData.escalatedLevel}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="expertsContacted"
                      label="Experts Contacted"
                      value={formData.expertsContacted}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="updateFrequency"
                      label="Update Frequency In Mins"
                      value={formData.updateFrequency}
                      onChange={handleChange}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0" }} // Optional: to ensure only positive numbers
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="checkedWithOtherAccounts"
                      label="Checked With Other Accounts"
                      value={formData.checkedWithOtherAccounts}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="coreExpertsInvolved"
                      label="Core Experts Involved"
                      value={formData.coreExpertsInvolved}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="etaForResolution"
                      label="ETA For Resolution"
                      value={formData.etaForResolution}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  {formData.statusforfileds !== "Closed" && (
                    <Grid item xs={3}>
                      <Button variant="contained" color="primary" type="submit">
                        Update Details
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </div>
          )}

          {whatsAppAndCopy && (
            <Container
              maxWidth="md"
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "16px",
                marginTop: "20px",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ width: "95%", textAlign: "left" }}
                >
                  Scan QR for sending details to WhatsApp
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={handleClose}
                  style={{ width: "5%" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {/* Add space between the text and QRCode */}
              <Box mb={2} />
              {/* Call the WhatsAppQRCode component with the phoneNumber and data props */}
              <QRCode value={whatsappLink} size={256} />{" "}
              {/* Adjust the size as needed */}
            </Container>
          )}

          {submittedData && (
            <Container
              maxWidth="md"
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "16px",
                marginTop: "20px",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ width: "90%", textAlign: "left" }}
                >
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
                    <div
                      style={{
                        marginLeft: "10px",
                        fontStyle: "italic",
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Copied:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        incident details
                      </span>
                    </div>
                  )}
                </div>
              </Box>
              <Container maxWidth="md">
                <Typography variant="body1" gutterBottom>
                  <pre style={{ textAlign: "left" }}>{detailsToCopy}</pre>
                </Typography>
              </Container>
            </Container>
          )}

          {whatsAppAndCopyAfterIncClose && (
            <Container
              maxWidth="md"
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "16px",
                marginTop: "20px",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ width: "95%", textAlign: "left" }}
                >
                  Scan QR for sending details to WhatsApp
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={handleClose}
                  style={{ width: "5%" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {/* Add space between the text and QRCode */}
              <Box mb={2} />
              {/* Call the WhatsAppQRCode component with the phoneNumber and data props */}
              <QRCode value={whatsappLinkAfterIncClosed} size={256} />{" "}
              {/* Adjust the size as needed */}
            </Container>
          )}

          {whatsAppAndCopyAfterIncClose && (
            <Container
              maxWidth="md"
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "16px",
                marginTop: "20px",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ width: "90%", textAlign: "left" }}
                >
                  Submitted Incident Details
                </Typography>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {!copied ? (
                    <Button
                      variant="outlined"
                      color="inherit"
                      style={{ width: "10%" }}
                      onClick={handleCopyForIncClose}
                      title="Copy"
                    >
                      <FileCopyIcon />
                    </Button>
                  ) : (
                    <CheckCircleIcon sx={{ color: "green" }} />
                  )}
                  {copied && (
                    <div
                      style={{
                        marginLeft: "10px",
                        fontStyle: "italic",
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Copied:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        incident details
                      </span>
                    </div>
                  )}
                </div>
              </Box>
              <Container maxWidth="md">
                <Typography variant="body1" gutterBottom>
                  <pre style={{ textAlign: "left" }}>
                    {dataForWhatAppandCopyAfterIncCLosed}
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
