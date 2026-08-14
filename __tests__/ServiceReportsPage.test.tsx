import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ServiceReportsPage from '../app/dashboard/service-manager/reports/page'

// Mock react-icons to prevent rendering issues
vi.mock('react-icons/fi', () => ({
  FiPlus: () => <span data-testid="plus-icon" />,
  FiList: () => <span />,
  FiFileText: () => <span />,
  FiTrash2: () => <span />,
  FiSearch: () => <span />,
  FiPrinter: () => <span />,
  FiCheckCircle: () => <span />,
  FiAlertCircle: () => <span />,
  FiClock: () => <span />,
  FiX: () => <span />
}))

// Mock configuration
vi.mock('@/config', () => ({
  default: {
    API_BASE_URL: 'http://localhost:8081'
  }
}))

// Helper to mock fetch responses
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Service Manager Reports & Invoice Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock fetch responses for initial load
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/invoices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url.includes('/api/reports')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('Unknown url'))
    })
  })

  it('renders initial summary cards for Invoices and Operations', () => {
    render(<ServiceReportsPage />)
    expect(screen.getByText('Customer Invoices')).toBeInTheDocument()
    expect(screen.getByText('Daily Operations Report')).toBeInTheDocument()
  })

  it('navigates to Generate Invoice view when clicking button', () => {
    render(<ServiceReportsPage />)
    
    const generateBtn = screen.getByRole('button', { name: /Generate Invoice/i })
    fireEvent.click(generateBtn)

    expect(screen.getByText('Invoice Configuration')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter UUID (e.g. 123e4567...)')).toBeInTheDocument()
  })

  it('verifies booking details and updates pricing dynamically when custom inputs are configured', async () => {
    render(<ServiceReportsPage />)
    
    // Navigate to Invoice config
    const generateBtn = screen.getByRole('button', { name: /Generate Invoice/i })
    fireEvent.click(generateBtn)

    // Input booking ID
    const bookingInput = screen.getByPlaceholderText('Enter UUID (e.g. 123e4567...)')
    fireEvent.change(bookingInput, { target: { value: '123e4567-e89b-12d3-a456-426614174000' } })

    // Mock fetch for getting booking details
    mockFetch.mockImplementationOnce((url) => {
      if (url.includes('/api/bookings/123e4567-e89b-12d3-a456-426614174000')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            bookingId: '123e4567-e89b-12d3-a456-426614174000',
            centerId: 'center-123',
            customerId: 'customer-123',
            estimatedCost: 5000.00,
            serviceCenterName: 'FixZone Kandy',
            packageName: 'Full Service Tune-up',
            bookingDate: '2026-05-12',
            status: 'COMPLETED'
          })
        })
      }
      return Promise.reject(new Error('Unknown url'))
    })

    // Click fetch
    const fetchBtn = screen.getByRole('button', { name: /Fetch Data/i })
    fireEvent.click(fetchBtn)

    // Wait for the booking verification box to render
    await waitFor(() => {
      expect(screen.getByText('Booking Verified')).toBeInTheDocument()
    })
    
    expect(screen.getAllByText('Full Service Tune-up')[0]).toBeInTheDocument()
    
    // Check initial subtotal (base cost = 5000)
    expect(screen.getByText('Rs 5,000')).toBeInTheDocument()

    // Add additional part name and price
    const partNameInput = screen.getByPlaceholderText('e.g. Brake Pads, Oil Filter')
    const partPriceInput = screen.getAllByPlaceholderText('0.00')[0]

    fireEvent.change(partNameInput, { target: { value: 'Engine Oil Filter' } })
    fireEvent.change(partPriceInput, { target: { value: '1200' } })

    // Input discount
    const discountInput = screen.getAllByPlaceholderText('0.00')[1]
    fireEvent.change(discountInput, { target: { value: '200' } })

    // Calculate expected total: 5000 (base) + 1200 (filter) - 200 (discount) = 6000
    // Check that total updates dynamically to 6000.00
    await waitFor(() => {
      expect(screen.getByText('Rs 6,000.00')).toBeInTheDocument()
    })
  })

  it('submits a daily operations report successfully', async () => {
    // Mock window.alert to prevent jsdom crash
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(<ServiceReportsPage />)
    
    // Navigate to Create Report
    const createReportBtn = screen.getByRole('button', { name: /Create Today Report/i })
    fireEvent.click(createReportBtn)

    expect(screen.getByText('New Daily Report')).toBeInTheDocument()

    // Fill form
    const incompleteServicesInput = container.querySelector('input[name="incompleteServices"]') as HTMLInputElement
    fireEvent.change(incompleteServicesInput, { target: { value: '3' } })

    const revenueInput = container.querySelector('input[name="revenue"]') as HTMLInputElement
    fireEvent.change(revenueInput, { target: { value: '25000' } })

    const vehiclesServicedInput = container.querySelector('input[name="vehiclesServiced"]') as HTMLInputElement
    fireEvent.change(vehiclesServicedInput, { target: { value: '15' } })

    const summaryInput = container.querySelector('textarea[name="summary"]') as HTMLTextAreaElement
    fireEvent.change(summaryInput, { target: { value: 'All tasks completed successfully.' } })

    // Mock fetch for reports POST
    mockFetch.mockImplementationOnce((url, options) => {
      if (url.includes('/api/reports') && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      return Promise.reject(new Error('Unknown url'))
    })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create Report/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Report Created!')
    })
    
    alertMock.mockRestore()
  })
})
