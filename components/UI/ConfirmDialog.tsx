"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button as MuiButton,
  Box,
} from "@mui/material";
import { FiTrash2, FiAlertTriangle, FiCheckCircle, FiHelpCircle, FiX } from "react-icons/fi";

export type DialogVariant = "danger" | "warning" | "success" | "info";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const variantConfig: Record<
  DialogVariant,
  { iconBg: string; iconColor: string; btnColor: string; btnHover: string; icon: React.ReactNode }
> = {
  danger: {
    iconBg: "#fef2f2",
    iconColor: "#dc2626",
    btnColor: "#dc2626",
    btnHover: "#b91c1c",
    icon: <FiTrash2 size={24} />,
  },
  warning: {
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    btnColor: "#d97706",
    btnHover: "#b45309",
    icon: <FiAlertTriangle size={24} />,
  },
  success: {
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    btnColor: "#16a34a",
    btnHover: "#15803d",
    icon: <FiCheckCircle size={24} />,
  },
  info: {
    iconBg: "rgba(234, 88, 12, 0.1)",
    iconColor: "#ea580c",
    btnColor: "#ea580c",
    btnHover: "#c2410c",
    icon: <FiHelpCircle size={24} />,
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const config = variantConfig[variant] || variantConfig.danger;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "1.25rem",
          overflow: "hidden",
          maxWidth: 400,
          width: "100%",
          p: 0,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <Box sx={{ p: 3.5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Soft-Tinted Icon Circle */}
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: "1rem",
            bgcolor: config.iconBg,
            color: config.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {config.icon}
        </Box>

        <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 700, fontSize: "1.15rem", color: "#0f172a" }}>
          {title}
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: "0.875rem" }}>
            {message}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 0, width: "100%", gap: 1.5 }}>
          <MuiButton
            onClick={onClose}
            disabled={isLoading}
            sx={{
              flex: 1,
              py: 1.1,
              borderRadius: "0.65rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
              bgcolor: "#f1f5f9",
              "&:hover": { bgcolor: "#e2e8f0" },
            }}
          >
            {cancelText}
          </MuiButton>

          <MuiButton
            onClick={onConfirm}
            disabled={isLoading}
            sx={{
              flex: 1,
              py: 1.1,
              borderRadius: "0.65rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#ffffff !important",
              bgcolor: `${config.btnColor} !important`,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              "&:hover": {
                bgcolor: `${config.btnHover} !important`,
              },
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </MuiButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
