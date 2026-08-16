"use client";

import React from "react";
import { Snackbar, Alert as MuiAlert } from "@mui/material";

export type SeverityType = "success" | "error" | "warning" | "info";

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity?: SeverityType;
  autoHideDuration?: number;
  onClose: () => void;
}

export default function FeedbackSnackbar({
  open,
  message,
  severity = "success",
  autoHideDuration = 4000,
  onClose,
}: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ zIndex: 9999 }}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity}
        variant="standard"
        elevation={3}
        sx={{
          borderRadius: "12px",
          fontWeight: 500,
          fontSize: "0.875rem",
          alignItems: "center",
          minWidth: "280px",
        }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
