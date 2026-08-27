"use client";

import React from "react";

export interface InvoiceLineItem {
  name: string;
  description?: string;
  price: number;
}

export interface InvoiceDocumentProps {
  id?: string;
  invoiceNumber: string;
  issuedDate?: string | Date;
  status?: string;
  serviceCenter?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  billTo?: {
    customerName?: string;
    vehicle?: string;
    vehicleNumber?: string;
    customerId?: string;
  };
  serviceDetails?: {
    centerName?: string;
    bookingRef?: string;
  };
  lineItems?: InvoiceLineItem[];
  subtotal: number;
  discount?: number;
  discountLabel?: string;
  advancePaid?: number;
  tax?: number;
  total: number;
}

export default function InvoiceDocument({
  id = "printable-invoice",
  invoiceNumber,
  issuedDate,
  status = "ISSUED",
  serviceCenter,
  billTo,
  serviceDetails,
  lineItems = [],
  subtotal = 0,
  discount = 0,
  discountLabel,
  advancePaid = 0,
  tax = 0,
  total = 0,
}: InvoiceDocumentProps) {
  const formattedDate = React.useMemo(() => {
    if (!issuedDate) {
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    try {
      const d = new Date(issuedDate);
      return isNaN(d.getTime())
        ? String(issuedDate)
        : d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return String(issuedDate);
    }
  }, [issuedDate]);

  const isPaid = (status || "").toUpperCase() === "PAID";

  return (
    <div
      id={id}
      className="bg-white shadow-xl overflow-hidden print:shadow-none print:border-none p-6 sm:p-12 relative border-t-8 border-slate-900 rounded-none w-full font-sans text-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 sm:mb-14 mt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Invoice
            </h1>
            {status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm pt-2">
            <span className="text-slate-500 font-medium">Invoice No.</span>
            <span className="text-slate-900 font-bold font-mono">{invoiceNumber}</span>
            <span className="text-slate-500 font-medium">Date</span>
            <span className="text-slate-900 font-bold">{formattedDate}</span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
            {serviceCenter?.name || "FIXZONE AUTO"}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {serviceCenter?.address || "123 Service Road, Auto City"}
            <br />
            {serviceCenter?.email || "contact@fixzone.lk"}
            <br />
            {serviceCenter?.phone || "+94 (11) 234-5678"}
          </p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8 sm:mb-10 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Bill To
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <div>
            <p className="text-slate-900 font-bold text-lg mb-1">
              {billTo?.customerName || "Valued Customer"}
            </p>
            <p className="text-slate-600 text-sm">
              Vehicle:{" "}
              <span className="font-medium text-slate-800">
                {billTo?.vehicle || "Vehicle"}{" "}
                {billTo?.vehicleNumber ? `(${billTo.vehicleNumber})` : ""}
              </span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Customer ID:{" "}
              <span className="font-mono text-slate-700">
                {billTo?.customerId ? billTo.customerId.substring(0, 8) : "N/A"}
              </span>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-slate-900 font-bold text-lg mb-1">Service Details</p>
            <p className="text-slate-600 text-sm">
              Center:{" "}
              <span className="font-medium text-slate-800">
                {serviceDetails?.centerName || serviceCenter?.name || "FixZone Auto Center"}
              </span>
            </p>
            <p className="text-slate-600 text-sm mt-0.5">
              Booking Ref:{" "}
              <span className="font-mono font-medium text-slate-800">
                {serviceDetails?.bookingRef ? serviceDetails.bookingRef.substring(0, 8) : "N/A"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-900 w-full">
                Description
              </th>
              <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-900 text-right whitespace-nowrap">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineItems.length > 0 ? (
              lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-2">
                    <p className="text-base text-slate-900 font-bold">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-base text-slate-900 text-right font-bold whitespace-nowrap">
                    Rs{" "}
                    {Number(item.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-2">
                  <p className="text-base text-slate-900 font-bold">General Vehicle Service</p>
                  <p className="text-sm text-slate-500 mt-0.5">Standard vehicle service package</p>
                </td>
                <td className="py-4 px-2 text-base text-slate-900 text-right font-bold whitespace-nowrap">
                  Rs{" "}
                  {Number(subtotal || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex justify-end">
        <div className="w-full max-w-md">
          <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-slate-800 font-bold">
                Rs{" "}
                {Number(subtotal || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Tax</span>
                <span className="text-slate-800 font-bold">
                  Rs{" "}
                  {Number(tax || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span className="font-medium">{discountLabel || "Special Discount"}</span>
                <span className="font-bold">
                  - Rs{" "}
                  {Number(discount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {advancePaid > 0 && (
              <div className="flex justify-between text-sm text-emerald-700">
                <span className="font-medium">Advance Fee Paid</span>
                <span className="font-bold">
                  - Rs{" "}
                  {Number(advancePaid || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                {isPaid ? "Total Paid" : "Balance Due"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Rs{" "}
                {Number(total || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm font-medium">
          Thank you for choosing {serviceCenter?.name || "FixZone Auto"}. We appreciate your business!
        </p>
      </div>
    </div>
  );
}
