import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProfilePage from '../app/dashboard/company-owner/profile/page'
import axios from '@/lib/axios'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) })
}))

const mockOwnerData = {
  companyName: 'FixZone Colombo Group',
  ownerCode: 'OWNER001',
  companyEmail: 'owner@fixzone.com',
  companyNumber: '0771234567',
  address: '123 Main St, Colombo'
}

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    ownerData: mockOwnerData,
    isLoading: false,
    refreshAll: vi.fn()
  })
}))

describe('Company Owner Profile Tab Page', () => {
  it('renders owner profile headers and details', () => {
    render(<ProfilePage />)
    
    expect(screen.getByRole('heading', { name: 'FixZone Colombo Group' })).toBeInTheDocument()
    expect(screen.getByText('owner@fixzone.com')).toBeInTheDocument()
    expect(screen.getByText('0771234567')).toBeInTheDocument()
  })

  it('renders tab options and changes active section', () => {
    render(<ProfilePage />)
    
    const settingsTab = screen.getByRole('tab', { name: /Account/i })
    expect(settingsTab).toBeInTheDocument()
    
    fireEvent.click(settingsTab)
    expect(screen.getByText('Change Password')).toBeInTheDocument()
  })

  it('renders billing tab and loads subscription plans', async () => {
    // Mock plans fetch response
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: [
        { planId: 'plan_basic', name: 'Basic Plan', price: 5000, durationMonths: 1 },
        { planId: 'plan_growth', name: 'Growth Plan', price: 12000, durationMonths: 3 }
      ]
    })

    render(<ProfilePage />)
    
    // Switch to Billing tab (tab index 2)
    const billingTab = screen.getByRole('tab', { name: /Billing/i })
    expect(billingTab).toBeInTheDocument()
    
    fireEvent.click(billingTab)

    // Check eventual layout render
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Rs. 12,000 / 3 months')).toBeInTheDocument()
    })
  })

  it('initiates stripe checkout when subscribing to a plan', async () => {
    // Mock plans and checkout session creation responses
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: [
        { planId: 'plan_basic', name: 'Basic Plan', price: 5000, durationMonths: 1 }
      ]
    })
    
    const checkoutUrl = 'https://checkout.stripe.com/pay/session_123'
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: checkoutUrl
    })

    // Mock window location to prevent routing errors in JSDOM
    const win = window as any
    const originalLocation = win.location
    delete win.location
    win.location = { href: '' }

    render(<ProfilePage />)
    
    // Go to Billing
    fireEvent.click(screen.getByRole('tab', { name: /Billing/i }))

    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    })

    // Select the plan
    fireEvent.click(screen.getByLabelText(/Basic Plan/i))

    // Click proceed to payment button
    const payBtn = screen.getByRole('button', { name: /Proceed to Payment/i })
    fireEvent.click(payBtn)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/checkout'),
        expect.objectContaining({ planId: 'plan_basic', autoRenew: false })
      )
      expect(win.location.href).toBe(checkoutUrl)
    })

    // Restore location
    win.location = originalLocation
  })
})
