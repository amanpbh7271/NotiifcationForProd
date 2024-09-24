import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

const DesktopNotification = () => {
  const [incidentNumbersP1, setIncidentNumbersP1] = useState({});
  const [incidentNumbersP2, setIncidentNumbersP2] = useState({});
  const [timeForPriorityP1, setTimeForPriorityP1] = useState(2);
  const [timeForPriorityP2, setTimeForPriorityP2] = useState(10);
  const [accountNames, setAccountNames] = useState([]);
  const [userId, setUserId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  useEffect(() => {
    if (userDetails) {
      setUserId(userDetails.user_id);
    } else {
      setUserId(null);
      console.log("No user details found in local storage.");
    }
  }, [userDetails]);

  useEffect(() => {
    const fetchAccountNames = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/accountForUser/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const names = data.map(account => account.Account_Name);
            setAccountNames(names);
            console.log("Fetched account names:", names);
          } else {
            console.error('Failed to fetch account names:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching account names:', error);
        }
      }
    };

    fetchAccountNames();
  }, [userId]);

  useEffect(() => {
    const fetchTimeForPriorities = async () => {
      try {
        const [responseForP1, responseForP2] = await Promise.all([
          fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/timeForPriority/P1`),
          fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/timeForPriority/P2`)
        ]);

        if (responseForP1.ok) {
          const dataForP1 = await responseForP1.json();
          setTimeForPriorityP1(parseInt(dataForP1));
          console.log("Time for P1 set to:", dataForP1);
        }
        
        if (responseForP2.ok) {
          const dataForP2 = await responseForP2.json();
          setTimeForPriorityP2(parseInt(dataForP2));
          console.log("Time for P2 set to:", dataForP2);
        }
      } catch (error) {
        console.error('Error fetching time for priorities:', error);
      }
    };

    fetchTimeForPriorities();
  }, []);

  useEffect(() => {
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
          console.error(`Failed to fetch incident numbers for ${priority} and ${accountName}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error fetching incident numbers for ${priority} and ${accountName}:`, error);
      }
    };

    if (accountNames.length > 0) {
      accountNames.forEach(accountName => {
        fetchIncidentNumbers('P1', accountName);
        fetchIncidentNumbers('P2', accountName);
      });
    }

    const intervalIdP1 = setInterval(() => {
      accountNames.forEach(accountName => fetchIncidentNumbers('P1', accountName));
    }, timeForPriorityP1 * 60 * 1000);

    const intervalIdP2 = setInterval(() => {
      accountNames.forEach(accountName => fetchIncidentNumbers('P2', accountName));
    }, timeForPriorityP2 * 60 * 1000);

    return () => {
      clearInterval(intervalIdP1);
      clearInterval(intervalIdP2);
    };
  }, [accountNames, timeForPriorityP1, timeForPriorityP2]);

  useEffect(() => {
    const showCustomNotification = (priority, incidentNumbers) => {
      const incidents = Object.values(incidentNumbers).flat();
      if (incidents.length === 0) return;

      const notificationMessage = `Below are the open incidents for ${priority} priority:`;
      const notificationDetails = incidents.join(', ');

      setSnackbarMessage(`${notificationMessage}\n${notificationDetails}`);
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      console.log("Snackbar message set:", notificationMessage);
    };

    if (accountNames.length > 0) {
      if (Object.keys(incidentNumbersP1).length > 0) {
        showCustomNotification('P1', incidentNumbersP1);
      }
      if (Object.keys(incidentNumbersP2).length > 0) {
        showCustomNotification('P2', incidentNumbersP2);
      }
    }
  }, [incidentNumbersP1, incidentNumbersP2, accountNames]);

  useEffect(() => {
    // Check for userDetails in local storage after showing alerts
    const checkUserDetails = () => {
      const updatedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
      if (!updatedUserDetails) {
        // Reset state values if user details are not found
        console.log("User details not found in local storage after alert.");
        setUserId(null);
        setAccountNames([]);
        setIncidentNumbersP1({});
        setIncidentNumbersP2({});
      }
    };

    checkUserDetails();
  }, [openSnackbar]);

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
          <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
            Close
          </Button>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DesktopNotification;