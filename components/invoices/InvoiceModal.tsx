"use client";

import React from "react";
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import { FiX, FiPrinter } from "react-icons/fi";
import InvoiceDocument, { InvoiceDocumentProps } from "./InvoiceDocument";
import { printInvoiceElement } from "@/utils/printInvoice";
import Button from "@/components/UI/Button";

export interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceDocumentProps | null;
  isLoading?: boolean;
}

export default function InvoiceModal({
  open,
  onClose,
  invoiceData,
  isLoading = false,
}: InvoiceModalProps) {
  if (!open) return null;

  const handlePrint = () => {
    if (!invoiceData) return;
    const invoiceNo = invoiceData.invoiceNumber || "Invoice";
    printInvoiceElement("printable-invoice-modal", `Invoice - ${invoiceNo}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "1.25rem",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* Top Modal Header Bar */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div>
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest block">
            FixZone Official Receipt
          </span>
          <h3 className="text-xl font-bold text-white">
            {invoiceData?.invoiceNumber ? `Invoice ${invoiceData.invoiceNumber}` : "Service Invoice"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onClose}
            sx={{
              color: "#94a3b8",
              "&:hover": { color: "#ffffff", backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <FiX className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Modal Body with Printable Invoice Document */}
      <DialogContent sx={{ p: 0, backgroundColor: "#f8fafc" }}>
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading invoice details...</p>
          </div>
        ) : invoiceData ? (
          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
            <InvoiceDocument
              id="printable-invoice-modal"
              {...invoiceData}
            />
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            Invoice data is currently unavailable.
          </div>
        )}
      </DialogContent>

      {/* Footer Controls */}
      <DialogActions sx={{ px: 4, py: 3, backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0", gap: 2 }}>
        <Button
          onClick={onClose}
          variant="secondary"
          className="py-2.5 px-5 text-slate-700 hover:bg-slate-100"
        >
          Close
        </Button>
        <Button
          onClick={handlePrint}
          variant="primary"
          className="py-2.5 px-6 !bg-slate-900 !hover:bg-slate-800 !text-white flex items-center justify-center gap-2 shadow-sm"
          disabled={isLoading || !invoiceData}
        >
          <FiPrinter className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
