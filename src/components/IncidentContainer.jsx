import React, { useState, useEffect, useRef } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, Navigate } from "react-router-dom";
import Header from "./Header";
import QRCode from "qrcode.react";
import FileCopyIcon from "@mui/icons-material/FileCopy"; // Importing copy icon
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Importing from @mui/icons-material
import { format } from "date-fns";

const useStyles = makeStyles(() => ({
  paper: {
    padding: "16px", // Adjust this value as needed
    margin: "auto",
    marginTop: "32px", // Adjust this value as needed
    maxWidth: 1000,
  },
  incNumberError: {
    color: "red",
  },
  incNumberHighlight: {
    // Add this class
    borderColor: "red",
  },
}));

const IncidentContainer = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    incNumber: "",
    region: "",
    account: "",
    status: "Open",
    addStatusUpdate: "",
    businessImpact: "",
    workAround: "",
    manager: "",
    issueOwnedBy: "",
    bridgeDetails: "",
    priority: "",
    problemStatement: "",
    date: format(new Date(), "yyyy-MM-dd"), // Set initial value to today's date
    time: format(new Date(), "HH:mm"), // Set initial value to current time
    // new added fields

    affectedServices: "", // New field
    problemIdentified: "", // New field (yes or no)
    escalatedLevel: "", // New field
    expertsContacted: "", // New field
    updateFrequency: "", // New field (10, 15 min time period)
    checkedWithOtherAccounts: "", // New field
    coreExpertsInvolved: "", // New field
    etaForResolution: "", // New field
    isEditing: false,
    newIncNumber: "",
  });

  const [incForm, setIncForm] = useState(true);
  const [regionOptions, setRegionOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [managersForAccount, setManagersForAccount] = useState([]);
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const [whatsAppAndCopy, SetWhatsAppAndCopy] = useState(false);
  const [date, SetDate] = useState("");
  const [time, SetTime] = useState("");
  const [whatsappLink, setWhatsAppLink] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(""); // Track selected region ID
  const [isIncNumberInDatabase, setIsIncNumberInDatabase] = useState(false); // Add this line
  const incNumberRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = async (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "incNumber") {
      setIsIncNumberInDatabase(false); // Reset the state when typing in the INC number field
    }

    if (name === "region") {
      const selectedRegion = regionOptions.find(
        (region) => region.Region_Name === value
      );
      if (selectedRegion) {
        setSelectedRegionId(selectedRegion.Region_ID);
        await fetchAccountOptionsForUser(selectedRegion.Region_ID);
      }
    }
  };

  const handleIncNumberClick = () => {
    setIsIncNumberInDatabase(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Check if the INC number is already in the database
      const response = await fetch(
        `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/incDetails/${formData.incNumber}`
      );
      if (response.ok) {
        const incidentData = await response.json();
        console.log("incident length is ", incidentData.length);
        if (incidentData.length > 0) {
          setIsIncNumberInDatabase(true);
          incNumberRef.current.focus();
          return; // Exit the function if the INC number is already in the database
        } else {
          setIsIncNumberInDatabase(false);
        }
      }

      // Extract date and time parts
      const currentDateFormatted = formData.date;
      const currentTimeFormatted = formData.time;

      // Create pre-updates object
      const preUpdates = [
        {
          timestamp: `${currentDateFormatted} ${currentTimeFormatted}`,
          message: formData.addStatusUpdate, // Assuming statusUpdate is the message
        },
      ];
      SetDate(currentDateFormatted);
      SetTime(currentTimeFormatted);

      // Include pre-updates along with other form data
      const formDataWithDateTimeAndPreUpdates = {
        ...formData,
        date: currentDateFormatted, // Add current date
        time: currentTimeFormatted, // Add current time
        impactStartDate: currentDateFormatted, // Set impactStartDate to the same value as date
        impactStartTime: currentTimeFormatted, // Set impactStartTime to the same value as time
        preUpdates: preUpdates, // Add pre-updates
        nextUpdate: formData.addStatusUpdate,
      };

      // Save the incident data
      const saveResponse = await fetch(
        "http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/saveInc",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataWithDateTimeAndPreUpdates),
        }
      );
      if (saveResponse.ok) {
        console.log("Incident data saved successfully");
        // Reset form after successful submission if needed
        setIncForm(false);
        SetWhatsAppAndCopy(true);
        setSubmittedData(formDataWithDateTimeAndPreUpdates); // Set submitted data
      } else {
        console.error("Failed to save incident data");
      }
    } catch (error) {
      console.error(
        "Error occurred while processing the incident data:",
        error
      );
    }
  };

  useEffect(() => {
    // Fetch managers when account changes
    const fetchManagers = async () => {
      try {
        if (formData.account) {
          const response = await fetch(
            `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/managerForAccounts/${formData.account}`
          );
          if (response.ok) {
            const dataforManager = await response.json();
            setManagersForAccount(dataforManager);
            console.log("dataforManager" + dataforManager);
          } else {
            console.error("Failed to fetch managers:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error occurred while fetching managers:", error);
      }
    };

    fetchManagers();
  }, [formData.account]);

  const fetchAccountOptionsForUser = async (regionId) => {
    try {
      const userIdForApi = userDetails.user_id;

      console.log("regionId  " + regionId);
      if (userIdForApi) {
        const response = await fetch(
          `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/userAccounts/${userIdForApi}/${regionId}`
        );

        if (response.ok) {
          const accountData = await response.json();
          setAccountOptions(accountData);
          console.log("account", accountData);
        } else {
          console.error(
            "Failed to fetch account options:",
            response.statusText
          );
        }
      }
    } catch (error) {
      console.error("Error occurred while fetching account options:", error);
    }
  };

  useEffect(() => {
    // Fetch region options for the user
    const fetchRegionOptionsForUser = async () => {
      try {
        //const userNameForApi = userDetails.username; // Replace with the username parameter you want to pass to the API
        const userIdForApi = userDetails.user_id;
        console.log("userIdForApi  " + userIdForApi);
        //http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/regionForUser/${userNameForApi}
        if (userIdForApi) {
          const response = await fetch(
            `http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/regionForUser/${userIdForApi}`
          );

          if (response.ok) {
            const regionData = await response.json();
            setRegionOptions(regionData);
            console.log("regionOptions", regionData);
          } else {
            console.error(
              "Failed to fetch region options:",
              response.statusText
            );
          }
        }
      } catch (error) {
        console.error("Error occurred while fetching region options:", error);
      }
    };

    fetchRegionOptionsForUser();
  }, []);

  useEffect(() => {
    // Generate WhatsApp link
    const generateWhatsAppLink = () => {
      // Construct your WhatsApp message link with the phone number and data
      //const  = 7772980155; // Replace with your phone number
      const phoneNumber = userDetails?.mobile ?? "7772980155";

      const dataForWhatsApp =
        "*Below are Details for raised INC*" +
        "\n*priority*:-" +
        formData.priority +
        "\n*Region* :-" +
        formData.region +
        "\n*Account* :-" +
        formData.account +
        "\n*IncNumber*:- " +
        formData.incNumber +
        "\n*Status*:-" +
        formData.status +
        "\n*Description/Problem Statement*:-" +
        formData.problemStatement +
        "\n*Business impact*:-" +
        formData.businessImpact +
        "\n*Work Around*:-" +
        formData.workAround +
        "\n*Date*:-" +
        date +
        "\n*Time*:-" +
        time +
        "\n*Updated/next Status*:-\n" +
        formData.addStatusUpdate +
        "\n*Bridge Details*:-" +
        formData.bridgeDetails +
        "\n*Affected Services*:-" +
        formData.affectedServices +
        "\n*Problem Identified*:-" +
        formData.problemIdentified +
        "\n*Escalated Level*:-" +
        formData.escalatedLevel +
        "\n*Experts Contacted*:-" +
        formData.expertsContacted +
        "\n*Update Frequency In Mins*:-" +
        formData.updateFrequency +
        "\n*Checked With Other Accounts*:-" +
        formData.checkedWithOtherAccounts +
        "\n*Core Experts Involved*:-" +
        formData.coreExpertsInvolved +
        "\n*ETA For Resolution*:-" +
        formData.etaForResolution;

      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        dataForWhatsApp
      )}`;
    };

    setWhatsAppLink(generateWhatsAppLink());
  }, [formData, date, time]);

  const handleClose = () => {
    navigate("/IncidentsList");
  };

  const detailsToCopy = submittedData
    ? `
  *Priority*:- ${submittedData.priority || ""}
  *Region*: ${submittedData.region || ""}
  *Account*: ${submittedData.account || ""}
  *Incident Number*:- ${submittedData?.incNumber || ""}
  *Status*:- ${submittedData.status || ""}
  *Description/Problem Statement*:- ${submittedData.problemStatement || ""}
  *Business Impact*:- ${submittedData.businessImpact || ""}
  *Workaround*:- ${submittedData.workAround || ""}
  *Date*:- ${submittedData.date || ""}
  *Time*:- ${submittedData.time || ""}
  *Status Update/Next Step*:- ${submittedData.nextUpdate || ""}
  *Bridge Details*:- ${submittedData.bridgeDetails || ""}
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

  const isAuthenticated = localStorage.getItem("token");
  console.log("isAuthenticated", isAuthenticated);

  if (!isAuthenticated) {
    console.log("hadslasd");
    return <Navigate to="/" />;
  }

  return (
    <div>
      <Header />
      <Paper elevation={3} className={classes.paper}>
        <Container maxWidth="md" className="incident-container">
          {incForm && (
            <div>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h5" gutterBottom style={{ width: "95%" }}>
                  Please Enter Incident Details
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
                  <Grid item xs={12} sm={12}>
                    <TextField
                      name="incNumber"
                      label="INC Number"
                      value={formData.incNumber}
                      onChange={handleChange}
                      onClick={handleIncNumberClick}
                      fullWidth
                      required
                      inputRef={incNumberRef} // Add this line
                      className={
                        isIncNumberInDatabase ? classes.incNumberHighlight : ""
                      } // Add this line
                    />
                    {isIncNumberInDatabase && (
                      <Typography
                        variant="body2"
                        className={classes.incNumberError}
                      >
                        INC number is already in the database, please check.
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      {regionOptions?.map((option) => (
                        <MenuItem
                          key={option?.Region_Name}
                          value={option?.Region_Name}
                        >
                          {option?.Region_Name}
                        </MenuItem>
                      ))}
                    </TextField>
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
                        <MenuItem
                          key={option?.Account_Name}
                          value={option?.Account_Name}
                        >
                          {option?.Account_Name}
                        </MenuItem>
                      ))}
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
                    />
                  </Grid>
                  {/* start time */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 minute intervals
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="businessImpact"
                      label="Business Impact"
                      value={formData.businessImpact}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="addStatusUpdate"
                      label="Status Update/Next Step"
                      value={formData.addStatusUpdate}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      required
                    />
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
                      select
                      label="Issue Owned By"
                      name="issueOwnedBy"
                      value={formData.issueOwnedBy}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      <MenuItem value="Amdocs">Amdocs</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="workAround"
                      label="Work Around"
                      value={formData.workAround}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={1}
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
                      required
                    />
                  </Grid>
                  {/* New fields */}
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
                      label="Problem Identified?"
                      name="problemIdentified"
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
                      label="Escalated to which external level"
                      value={formData.escalatedLevel}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="expertsContacted"
                      label="Experts needed/contacted"
                      value={formData.expertsContacted}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="updateFrequency"
                      label="Expected update frequency in mins"
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
                      label="Checked with other accounts"
                      value={formData.checkedWithOtherAccounts}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="coreExpertsInvolved"
                      label="Core experts involved"
                      value={formData.coreExpertsInvolved}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="etaForResolution"
                      label="ETA for resolution"
                      value={formData.etaForResolution}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
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
                  mb={2}
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
                <QRCode value={whatsappLink} />
              </Container>
            </div>
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
        </Container>
      </Paper>
    </div>
  );
};

export default IncidentContainer;
