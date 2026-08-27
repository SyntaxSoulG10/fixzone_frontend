/**
 * Utility to print or save an invoice as an A4 PDF cleanly using an invisible iframe.
 */
export function printInvoiceElement(elementId: string = "printable-invoice", invoiceTitle: string = "Invoice"): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const printContent = document.getElementById(elementId);
  if (!printContent) {
    console.warn(`[printInvoice] Element with id #${elementId} not found.`);
    return false;
  }

  let printFrame = document.getElementById("print-iframe") as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement("iframe");
    printFrame.id = "print-iframe";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (!frameDoc) {
    console.error("[printInvoice] Could not initialize print frame document.");
    return false;
  }

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${invoiceTitle}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          #${elementId} {
            width: 100% !important;
            min-height: 100% !important;
            box-sizing: border-box;
            padding: 15mm 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border-top-width: 8px !important;
            transform: scale(0.95);
            transform-origin: top center;
          }
          * {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch (err) {
      console.error("[printInvoice] Error executing print command", err);
    }
  }, 500);

  return true;
}
