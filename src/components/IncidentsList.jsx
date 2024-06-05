import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import Header from './Header'; // Import the Header component

const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const isAuthenticated = localStorage.getItem('token');
  const userDetails = JSON.parse(localStorage.getItem('userDetails')); // Retrieve user details from local storage
  const [dataFetched, setDataFetched] = useState(false); // Track whether data is fetched

  useEffect(() => {
    // Fetch incidents data only on component mount or when user details change
    const fetchData = async () => {
      try {
        if (userDetails && !dataFetched) { // Check if userDetails exist and data is not already fetched
          const username = userDetails.username;
          const response = await fetch(`http://inpnqsmrtop01:9090/logtest-0.0.1-SNAPSHOT/api/incDetailsForManager/${username}`);
          if (response.ok) {
            let data = await response.json();
            console.log(data);
            setIncidents(data);
            setDataFetched(true); // Set dataFetched to true after fetching data
          } else {
            console.error('Failed to fetch incident details:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error occurred while fetching incident details:', error);
      }
    };
    fetchData();
  }, [userDetails, dataFetched]); // Add dataFetched to the dependency array

  // Paginate to a specific page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Determine total number of pages
  const itemsPerPage = 7;
  const totalPages = Math.ceil(incidents.length / itemsPerPage);

  // Get incidents for current page
  const indexOfLastIncident = currentPage * itemsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - itemsPerPage;
  const currentIncidents = incidents.slice(indexOfFirstIncident, indexOfLastIncident);

  // Function to handle row hover
  const handleRowHover = (index) => {
    setSelectedRow(index);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/LoginForm" />;
  }

  return (
    <div>
      <Header />
      <Container maxWidth="md" style={{ marginTop: '40px' }}>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead style={{ backgroundColor: '#607d8b', color: '#fff' }}>
              <TableRow>
                <TableCell>Incident Number</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentIncidents.map((incident, index) => (
                <TableRow
                  key={incident.incNumber}
                  component={Link}
                  to={`/UpdateIncDetails/${incident.incNumber}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: index === selectedRow ? '#bbdefb' : index % 2 === 0 ? '#f5f5f5' : '#e0e0e0'
                  }}
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={() => handleRowHover(null)}
                >
                  <TableCell>{incident.incNumber}</TableCell>
                  <TableCell>{incident.account}</TableCell>
                  <TableCell>{incident.priority}</TableCell>
                  <TableCell>{incident.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button variant="contained" color="primary" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} startIcon={<KeyboardArrowLeft />}>Previous</Button>
          </div>
          <div>
            <Button variant="contained" color="primary" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} endIcon={<KeyboardArrowRight />}>Next</Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default IncidentsList;
