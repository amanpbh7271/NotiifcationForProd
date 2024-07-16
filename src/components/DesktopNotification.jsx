import React, { useEffect, useState } from 'react';

const DesktopNotification = () => {
  const [incidentNumbersP1, setIncidentNumbersP1] = useState({});
  const [incidentNumbersP2, setIncidentNumbersP2] = useState({});
  const [timeForPriorityP1, setTimeForPriorityP1] = useState(2); // Default to 15 minutes
  const [timeForPriorityP2, setTimeForPriorityP2] = useState(10); // Default to 30 minutes
  const [accountNames, setAccountNames] = useState([]); // State to store account names
  const [userId, setUserId] = useState(null); // State to store user_id
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
            setAccountNames(names); // Store array of account  names 
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
          } else if (priority === 'P2') {
            setIncidentNumbersP2(prevState => ({ ...prevState, [accountName]: data }));
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
    // Function to show desktop notification with incident numbers
    const showNotification = (priority, incidentNumbers, accountName) => {
      // Check if the browser supports notifications
      console.log("notification before window");
      if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return;
      }

      // Check if permission is granted
      if (Notification.permission === "granted") {
        console.log("notification granted window");
        // Construct notification message with incident numbers
        const notificationMessage = incidentNumbers ? incidentNumbers.join('\n') : '';

        // Show notification with incident numbers
        new Notification(`Open ${priority} Incidents for Account: ${accountName}`, { body: notificationMessage });
      } else if (Notification.permission !== "denied") {
        // Request permission
        Notification.requestPermission().then(permission => {
          console.log("notification permission window");
          if (permission === "granted") {
            // Show notification with incident numbers
            console.log("notification permission window permission === 141 lines");
            showNotification(priority, incidentNumbers, accountName);
          }
        });
      }
    };

    // Show notifications for each account and priority
    if (accountNames) {
      accountNames.forEach(accountName => {
        if (incidentNumbersP1[accountName]?.length > 0) {
          showNotification('P1', incidentNumbersP1[accountName], accountName);
        }
        if (incidentNumbersP2[accountName]?.length > 0) {
          showNotification('P2', incidentNumbersP2[accountName], accountName);
        }
      });
    }
  }, [incidentNumbersP1, incidentNumbersP2, accountNames]);

  return null; // This component doesn't render anything
};

export default DesktopNotification;
