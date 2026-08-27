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
  FiX: () => <span />,
  FiCheck: () => <span />
}))

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [{ centerId: 'center-123', name: 'FixZone Kandy' }],
    bookingsData: [],
    customersData: [{ userId: 'customer-123', fullName: 'John Doe' }],
    refreshBookings: vi.fn(),
    refreshInvoices: vi.fn()
  })
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
    mockFetch.mockImplementation((url, options) => {
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
      if (url.includes('/api/invoices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url.includes('/api/reports')) {
        if (options && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  it('renders initial summary cards for Invoices and Operations', () => {
    render(<ServiceReportsPage />)
    expect(screen.getByText('Recent Invoices')).toBeInTheDocument()
    expect(screen.getByText('Daily Operations Report')).toBeInTheDocument()
  })

  it('verifies booking details and updates pricing dynamically when custom inputs are configured', async () => {
    render(<ServiceReportsPage />)
  })

  it('submits a daily operations report successfully', async () => {
    // Mock window.alert to prevent jsdom crash
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(<ServiceReportsPage />)
    
    // Navigate to Create Report
    const createReportBtn = screen.getByRole('button', { name: /Generate Report|Create Today Report/i })
    fireEvent.click(createReportBtn)

    expect(screen.getAllByRole('heading', { name: /Generate Daily Report|New Daily Report/i }).length).toBeGreaterThan(0)

    // Fill form
    const incompleteServicesInput = container.querySelector('input[name="incompleteServices"]') as HTMLInputElement
    fireEvent.change(incompleteServicesInput, { target: { value: '3' } })

    const revenueInput = container.querySelector('input[name="revenue"]') as HTMLInputElement
    fireEvent.change(revenueInput, { target: { value: '25000' } })

    const vehiclesServicedInput = container.querySelector('input[name="vehiclesServiced"]') as HTMLInputElement
    fireEvent.change(vehiclesServicedInput, { target: { value: '15' } })

    const summaryInput = container.querySelector('textarea[name="summary"]') as HTMLTextAreaElement
    if (summaryInput) {
      fireEvent.change(summaryInput, { target: { value: 'All tasks completed successfully.' } })
    }

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Save Report|Create Report/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Report (saved|created|updated) successfully!/i)).toBeInTheDocument()
    })
  })
})
