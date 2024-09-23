import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

const DesktopNotification = () => {
  const [incidentNumbersP1, setIncidentNumbersP1] = useState({});
  const [incidentNumbersP2, setIncidentNumbersP2] = useState({});
  const [timeForPriorityP1, setTimeForPriorityP1] = useState(2); // Default to 15 minutes
  const [timeForPriorityP2, setTimeForPriorityP2] = useState(10); // Default to 30 minutes
  const [accountNames, setAccountNames] = useState([]); // State to store account names
  const [userId, setUserId] = useState(null); // State to store user_id
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  useEffect(() => {
    if (userDetails) {
      setUserId(userDetails.user_id); // Set user_id from userDetails
    }
  }, [userDetails]);

  useEffect(() => {
    // Fetch account names for the user
    const fetchAccountNames = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/accountForUser/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const names = data.map(account => account.Account_Name);
            setAccountNames(names); // Store array of account names 
            console.log("Accountsname", names);
          } else {
            console.error('Failed to fetch account names:', response.statusText);
          }
        } catch (error) {
          console.error('Error occurred while fetching account names:', error);
        }
      }
    };

    fetchAccountNames();
  }, [userId]);

  useEffect(() => {
    // Function to fetch time for priorities P1 and P2
    const fetchTimeForPriorities = async () => {
      try {
        const responseForP1 = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/timeForPriority/P1`);
        const responseForP2 = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/timeForPriority/P2`);

        if (responseForP1.ok) {
          const dataforP1 = await responseForP1.json();
          setTimeForPriorityP1(parseInt(dataforP1)); // Convert time to integer for P1
        } else {
          console.error('Failed to fetch time for priority P1:', responseForP1.statusText);
        }
        
        if (responseForP2.ok) {
          const dataforP2 = await responseForP2.json();
          setTimeForPriorityP2(parseInt(dataforP2)); // Convert time to integer for P2
        } else {
          console.error('Failed to fetch time for priority P2:', responseForP2.statusText);
        }
      } catch (error) {
        console.error('Error occurred while fetching time for priorities P1 and P2:', error);
      }
    };

    fetchTimeForPriorities();
  }, []);

  useEffect(() => {
    // Function to fetch incident numbers for the specified account and priority
    const fetchIncidentNumbers = async (priority, accountName) => {
      try {
        const response = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/listOfIncFromAccountAndPriority/${priority}/${accountName}`);
        if (response.ok) {
          const data = await response.json();
          if (priority === 'P1') {
            setIncidentNumbersP1(prevState => ({ ...prevState, [accountName]: data }));
            console.log(`Fetched P1 incidents for ${accountName}:`, data);
          } else if (priority === 'P2') {
            setIncidentNumbersP2(prevState => ({ ...prevState, [accountName]: data }));
            console.log(`Fetched P2 incidents for ${accountName}:`, data);
          }
        } else {
          console.error(`Failed to fetch incident numbers for priority ${priority} and account ${accountName}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error occurred while fetching incident numbers for priority ${priority} and account ${accountName}:`, error);
      }
    };

    // Fetch incident numbers initially for each account
    if (accountNames) {
      accountNames.forEach(accountName => {
        fetchIncidentNumbers('P1', accountName);
        fetchIncidentNumbers('P2', accountName);
      });
    }

    // Schedule fetching incident numbers every timeForPriorityP1 minutes for P1
    const intervalIdP1 = setInterval(() => {
      if (accountNames) {
        accountNames.forEach(accountName => fetchIncidentNumbers('P1', accountName));
      }
    }, timeForPriorityP1 * 60 * 1000);

    // Schedule fetching incident numbers every timeForPriorityP2 minutes for P2
    const intervalIdP2 = setInterval(() => {
      if (accountNames) {
        accountNames.forEach(accountName => fetchIncidentNumbers('P2', accountName));
      }
    }, timeForPriorityP2 * 60 * 1000);

    // Clean up intervals on component unmount
    return () => {
      clearInterval(intervalIdP1);
      clearInterval(intervalIdP2);
    };
  }, [accountNames, timeForPriorityP1, timeForPriorityP2]);

  useEffect(() => {
    // Function to show custom notification with incident numbers
    const showCustomNotification = (priority, incidentNumbers) => {
      const incidents = Object.values(incidentNumbers).flat();
      if (incidents.length === 0) return; // No incidents to show

      // Construct notification message with incident numbers
      const notificationMessage = `Below are the open incidents for ${priority} priority:`;
      const notificationDetails = incidents.join(', ');

      // Add the notification to the state
      setSnackbarMessage(`${notificationMessage}\n${notificationDetails}`);
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
    };

    // Show notifications for each priority
    if (accountNames.length > 0) {
      if (Object.keys(incidentNumbersP1).length > 0) {
        showCustomNotification('P1', incidentNumbersP1);
      }
      if (Object.keys(incidentNumbersP2).length > 0) {
        showCustomNotification('P2', incidentNumbersP2);
      }
    }
  }, [incidentNumbersP1, incidentNumbersP2, accountNames]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Snackbar
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ width: '400px' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%', fontSize: '1.2rem', padding: '20px' }}>
          {snackbarMessage}
          {snackbarSeverity === 'success' && (
            <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
              Back to Login
            </Button>
          )}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DesktopNotification;