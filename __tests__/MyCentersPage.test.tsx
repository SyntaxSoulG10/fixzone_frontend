import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MyCentersPage from '../app/dashboard/company-owner/centers/page'
import axios from '@/lib/axios'

// Mock next/navigation search params
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null)
  })
}))

// Mock context hook
const mockRefreshAll = vi.fn()
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [
      { centerId: 'c1', name: 'Colombo Main Center', address: 'Galle Rd, Colombo', managerName: 'John Doe', contactPhone: '0771234567', isActive: true, revenue: 12000, mechanicsCount: 5, currentCapacity: 40 },
      { centerId: 'c2', name: 'Kandy Station', address: 'Peradeniya Rd, Kandy', managerName: 'Jane Smith', contactPhone: '0817654321', isActive: false, revenue: 5000, mechanicsCount: 2, currentCapacity: 10 }
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

  it('filters branches based on search input', () => {
    render(<MyCentersPage />)
    
    const searchInput = screen.getByPlaceholderText('Search branches...')
    expect(searchInput).toBeInTheDocument()

    // Search for Colombo
    fireEvent.change(searchInput, { target: { value: 'Colombo' } })
    
    expect(screen.getByText('Colombo Main Center')).toBeInTheDocument()
    expect(screen.queryByText('Kandy Station')).not.toBeInTheDocument()
  })

  it('opens the branch creation dialog modal when clicking New Branch', () => {
    render(<MyCentersPage />)
    
    const newBranchBtn = screen.getByRole('button', { name: /New Branch/i })
    fireEvent.click(newBranchBtn)

    expect(screen.getByText('Add New Service Center')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Branch/i })).toBeInTheDocument()
  })

  it('validates missing required inputs and triggers error messages', async () => {
    render(<MyCentersPage />)
    
    const newBranchBtn = screen.getByRole('button', { name: /New Branch/i })
    fireEvent.click(newBranchBtn)

    const createBtn = screen.getByRole('button', { name: /Create Branch/i })
    fireEvent.click(createBtn)

    // Expecting error snackbar because fields are empty
    expect(screen.getByText('Center name must be at least 3 characters')).toBeInTheDocument()
  })
})
