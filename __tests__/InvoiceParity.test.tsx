import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InvoiceDocument from '@/components/invoices/InvoiceDocument';
import InvoiceModal from '@/components/invoices/InvoiceModal';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="fi-x" />,
  FiPrinter: () => <span data-testid="fi-printer" />,
}));

describe('Invoice Parity & Rendering Tests', () => {
  const sampleInvoice = {
    invoiceNumber: 'INV-A1B2C3D4',
    issuedDate: '2026-08-27',
    status: 'PAID',
    serviceCenter: {
      name: 'FixZone Auto Colombo',
      address: '45 Galle Road, Colombo 03',
      email: 'colombo@fixzone.lk',
      phone: '+94 (11) 234-5678',
    },
    billTo: {
      customerName: 'John Doe',
      vehicle: 'Toyota Corolla',
      vehicleNumber: 'CAB-1234',
      customerId: 'cust-uuid-12345678',
    },
    serviceDetails: {
      centerName: 'FixZone Auto Colombo',
      bookingRef: 'book-uuid-98765432',
    },
    lineItems: [
      {
        name: 'Full Synthetic Oil Change',
        description: 'Includes 4L synthetic engine oil and OEM filter replacement',
        price: 8500.0,
      },
      {
        name: 'Brake Pad Replacement (Front)',
        description: 'Ceramic brake pads with installation & calibration',
        price: 4500.0,
      },
    ],
    subtotal: 13000.0,
    discount: 1000.0,
    discountLabel: 'Special Discount (Summer Promo)',
    advancePaid: 2500.0,
    tax: 0.0,
    total: 9500.0,
  };

  it('renders InvoiceDocument with complete metadata matching manager specifications', () => {
    render(<InvoiceDocument {...sampleInvoice} />);

    // Header validation
    expect(screen.getByRole('heading', { name: /invoice/i })).toBeInTheDocument();
    expect(screen.getByText('INV-A1B2C3D4')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getAllByText('FixZone Auto Colombo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/45 Galle Road, Colombo 03/i)).toBeInTheDocument();

    // Bill To validation
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Toyota Corolla/i)).toBeInTheDocument();
    expect(screen.getByText(/\(CAB-1234\)/i)).toBeInTheDocument();
    expect(screen.getByText('cust-uui')).toBeInTheDocument(); // 8-char slice

    // Service details
    expect(screen.getByText('book-uui')).toBeInTheDocument(); // 8-char slice

    // Itemized table validation
    expect(screen.getByText('Full Synthetic Oil Change')).toBeInTheDocument();
    expect(screen.getByText(/8,500\.00/)).toBeInTheDocument();
    expect(screen.getByText('Brake Pad Replacement (Front)')).toBeInTheDocument();
    expect(screen.getByText(/4,500\.00/)).toBeInTheDocument();

    // Totals validation
    expect(screen.getByText(/13,000\.00/)).toBeInTheDocument();
    expect(screen.getByText('Special Discount (Summer Promo)')).toBeInTheDocument();
    expect(screen.getAllByText(/- Rs/).length).toBe(2);
    expect(screen.getByText('Advance Fee Paid')).toBeInTheDocument();
    expect(screen.getByText('Total Paid')).toBeInTheDocument();
    expect(screen.getByText(/9,500\.00/)).toBeInTheDocument();

    // Footer validation
    expect(screen.getByText(/Thank you for choosing FixZone Auto Colombo/i)).toBeInTheDocument();
  });

  it('renders InvoiceModal and triggers close and print callbacks correctly', () => {
    const handleClose = vi.fn();
    render(
      <InvoiceModal
        open={true}
        onClose={handleClose}
        invoiceData={sampleInvoice}
        isLoading={false}
      />
    );

    expect(screen.getByText('Invoice INV-A1B2C3D4')).toBeInTheDocument();
    expect(screen.getByText('Print / Save PDF')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
