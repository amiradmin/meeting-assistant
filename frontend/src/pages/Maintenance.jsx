import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Maintenance() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar />
        <Box sx={{ mt: 10 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">صفحه نگهداری</Typography>
            <Typography>در اینجا اطلاعات نگهداری نمایش داده خواهد شد.</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
