import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MyCentersPage from '../app/dashboard/company-owner/centers/page'
import axios from '@/lib/axios'
import { getStripeConnectStatus, connectStripe } from '@/lib/api'

// Mock next/navigation search params
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null)
  })
}))

// Mock Stripe API
vi.mock('@/lib/api', () => ({
  getStripeConnectStatus: vi.fn().mockResolvedValue({ stripeConnected: true }),
  connectStripe: vi.fn().mockResolvedValue('https://stripe.com/onboarding')
}))

// Mock context hook
const mockRefreshAll = vi.fn()
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    ownerData: {
      userId: 'owner1',
      stripeOnboardingComplete: true,
      subscriptionStatus: 'TRIAL_ACTIVE'
    },
    centersData: [
      { centerId: 'c1', name: 'Colombo Main Center', address: 'Galle Rd, Colombo', managerName: 'John Doe', contactPhone: '0771234567', isActive: true, revenue: 12000, mechanicsCount: 5, currentCapacity: 40 },
      { centerId: 'c2', name: 'Kandy Station', address: 'Peradeniya Rd, Kandy', managerName: 'Jane Smith', contactPhone: '0817654321', isActive: false, revenue: 5000, mechanicsCount: 2, currentCapacity: 10 },
      { centerId: 'c3', name: 'Galle Auto Care', address: 'Matara Rd, Galle', managerName: 'Sunil Perera', contactPhone: '0912233445', isActive: false, status: 'SUSPENDED', revenue: 8000, mechanicsCount: 4, currentCapacity: 30 }
    ],
    isLoading: false,
    refreshAll: mockRefreshAll,
  })
}))

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
}))

describe('Service Centers (Branches) Management Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStripeConnectStatus).mockResolvedValue({ stripeConnected: true })
  })

  it('renders all branch cards with correct details', () => {
    render(<MyCentersPage />)
    
    expect(screen.getByText('Colombo Main Center')).toBeInTheDocument()
    expect(screen.getByText('Galle Rd, Colombo')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('0771234567')).toBeInTheDocument()
    expect(screen.getByText('Rs.12,000')).toBeInTheDocument()

    expect(screen.getByText('Kandy Station')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('0817654321')).toBeInTheDocument()
    expect(screen.getByText('Rs.5,000')).toBeInTheDocument()
  })

  it('displays Suspended by Admin chip and warning alert when a branch has status SUSPENDED', () => {
    render(<MyCentersPage />)

    expect(screen.getByText('Galle Auto Care')).toBeInTheDocument()
    expect(screen.getByText('Suspended')).toBeInTheDocument()
    expect(screen.getByText(/Suspended by Administrator/i)).toBeInTheDocument()
    expect(screen.getByText('Suspended by Admin')).toBeInTheDocument()
  })

  it('filters branches based on search input', () => {
    render(<MyCentersPage />)
    
    const searchInput = screen.getByPlaceholderText('Search branches...')
    expect(searchInput).toBeInTheDocument()

    // Search for Colombo
    fireEvent.change(searchInput, { target: { value: 'Colombo' } })
    
    expect(screen.getByText('Colombo Main Center')).toBeInTheDocument()
    expect(screen.queryByText('Kandy Station')).not.toBeInTheDocument()
  })

  it('opens the branch creation dialog modal when clicking New Branch and confirms autodetect is removed', () => {
    render(<MyCentersPage />)
    
    const newBranchBtn = screen.getByRole('button', { name: /New Branch/i })
    fireEvent.click(newBranchBtn)

    expect(screen.getByText('Add New Service Center')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Branch/i })).toBeInTheDocument()
    
    // Ensure Auto-detect button is removed
    expect(screen.queryByText(/Auto-detect/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Detecting GPS/i)).not.toBeInTheDocument()

    // Ensure Google Maps Share Link is present
    expect(screen.getByPlaceholderText('e.g. https://maps.app.goo.gl/...')).toBeInTheDocument()
  })

  it('validates missing required inputs including Google Maps link', async () => {
    render(<MyCentersPage />)
    
    const newBranchBtn = screen.getByRole('button', { name: /New Branch/i })
    fireEvent.click(newBranchBtn)

    // Fill only name
    const nameInput = screen.getByPlaceholderText('e.g. Colombo West Branch')
    fireEvent.change(nameInput, { target: { value: 'Galle Express Care' } })

    // Fill location
    const locationInput = screen.getByPlaceholderText('Enter the full street address or landmarks')
    fireEvent.change(locationInput, { target: { value: '123 Matara Road, Galle' } })

    const createBtn = screen.getByRole('button', { name: /Create Branch/i })
    fireEvent.click(createBtn)

    // Expecting error snackbar because Google Maps link is missing
    expect(screen.getByText('Google Maps link is required')).toBeInTheDocument()

    // Fill invalid URL
    const mapsInput = screen.getByPlaceholderText('e.g. https://maps.app.goo.gl/...')
    fireEvent.change(mapsInput, { target: { value: 'invalid-url-without-http' } })
    fireEvent.click(createBtn)

    expect(screen.getByText(/Please enter a valid Google Maps link/i)).toBeInTheDocument()
  })

  it('blocks creating a branch and shows error when Stripe account is not connected', async () => {
    vi.mocked(getStripeConnectStatus).mockResolvedValue({ stripeConnected: false })

    render(<MyCentersPage />)

    await waitFor(() => {
      expect(screen.getByText(/Stripe Account Required/i)).toBeInTheDocument()
    })

    const newBranchBtn = screen.getByRole('button', { name: /New Branch/i })
    fireEvent.click(newBranchBtn)

    // Verify modal did NOT open and error is shown
    expect(screen.queryByText('Add New Service Center')).not.toBeInTheDocument()
    expect(screen.getByText('Please complete your Stripe account setup first before creating a service center branch or HQ.')).toBeInTheDocument()
  })
})
