import React, { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LOGO from "./amdocs_2.png";
import { logout } from "../utils/auth.js"; // Import logout functions

const Header = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [incidentNumber, setIncidentNumber] = useState("");
  const [showBlinkingText, setShowBlinkingText] = useState(false);

  useEffect(() => {
    if (inputRef.current && incidentNumber === "") {
      inputRef.current.focus();
    }
  }, [incidentNumber]);

  const handleSearch = () => {
    if (!incidentNumber) {
      setShowBlinkingText(true);
      return;
    }
    navigate(`/UpdateIncDetails/${incidentNumber}`);
  };

  const handleCreate = () => {
    navigate("/IncidentContainer");
    console.log("Create clicked");
  };

  const handleLogout = () => {
    logout();
    navigate("/LoginForm");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo */}
        <Box sx={{ flex: "15%" }}>
          <Typography variant="h6" component="div">
            <img
              src={LOGO}
              alt="Logo"
              style={{ height: "40px", width: "auto" }}
            />
          </Typography>
        </Box>

        <Box sx={{ flex: "50%" }}>
          <Typography variant="h5">Incident Communicator</Typography>
        </Box>

        {/* Search Inc and icon */}
        <Box
          sx={{
            flex: "15%",
            display: "flex",
            alignItems: "center",
            position: "relative",
            paddingRight: "16px",
          }}
        >
          {/* Input field for Enter Inc Number */}
          <Box sx={{ flex: "1", paddingRight: "8px" }}>
            <InputBase
              placeholder="Enter Inc Number"
              style={{ color: "inherit", width: "100%" }}
              value={incidentNumber}
              onChange={(e) => {
                setIncidentNumber(e.target.value);
                setShowBlinkingText(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(); // Call handleSearch when Enter key is pressed
                }
              }}
              inputRef={inputRef}
            />
            {showBlinkingText && (
              <Typography
                variant="subtitle2"
                color="error"
                onClick={handleSearch} // Add this line
                style={{ cursor: "pointer" }} // Optional: to change the cursor to a pointer
              >
                Please enter INC
              </Typography>
            )}
          </Box>
          {/* Search icon */}
          <Box>
            <Tooltip title="Search Inc">
              <IconButton onClick={handleSearch} color="inherit">
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Create Inc */}
        <Box sx={{ flex: "5%" }}>
          <Tooltip title="Raise INC">
            <IconButton onClick={handleCreate} color="inherit">
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Logout */}
        <Box sx={{ flex: "5%" }}>
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} color="inherit">
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
