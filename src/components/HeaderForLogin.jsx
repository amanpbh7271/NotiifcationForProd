import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LOGO from "./amdocs.png";

const HeaderForLogin = () => {
  

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo */}
        <Box sx={{ flex: "5%" }}>
          <Typography variant="h6" component="div">
            <img
              src={LOGO}
              alt="Logo"
              style={{ height: "40px", width: "auto" }}
            />
          </Typography>
        </Box>

        {/* Incident Blast */}
        <Box sx={{ flex: "95%", textAlign: "right" }}>
          <Typography variant="h5">Incident Blast</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderForLogin;
