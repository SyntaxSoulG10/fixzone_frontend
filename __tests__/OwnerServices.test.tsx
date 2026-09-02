import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ServicesPage from '../app/dashboard/company-owner/services/page'

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [
      { centerId: 'c1', name: 'Colombo Main Center' }
    ],
    isLoading: false,
    refreshAll: vi.fn()
  })
}))

// Mock axios responses for packages
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      console.log('AXIOS GET MOCK:', url);
      if (url.includes('/service-packages')) {
        const payload = [
          { 
            packageId: 'pkg1', 
            centerId: 'c1', 
            name: 'Full Engine Tune', 
            description: 'Complete engine tuning and spark plugs replacement.', 
            basePrice: 7500, 
            estimatedDurationMins: 90, 
            type: 'Oil change,Filter replacement', 
            isActive: true 
          }
        ];
        console.log('RETURNING PACKAGES:', payload);
        return Promise.resolve({ data: payload })
      }
      if (url.includes('/service-centers')) {
        const payload = [
          {
            centerId: 'c1',
            name: 'Colombo Main Center'
          }
        ];
        console.log('RETURNING CENTERS:', payload);
        return Promise.resolve({ data: payload })
      }
      return Promise.resolve({ data: [] })
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
}))

describe('Company Owner Services Tab Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and renders registered service packages', async () => {
    render(<ServicesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Full Engine Tune')).toBeInTheDocument()
    })
    
    expect(screen.getByText('7,500.00')).toBeInTheDocument()
    expect(screen.getByText(/90 mins duration/i)).toBeInTheDocument()
  })

  it('opens package creation modal and shows validation errors on empty submission', async () => {
    render(<ServicesPage />)
    
    // Wait for centers and packages load to complete
    await waitFor(() => {
      expect(screen.getByText('Full Engine Tune')).toBeInTheDocument()
    })
    
    const newBtn = screen.getByRole('button', { name: /Create Package/i })
    fireEvent.click(newBtn)
    
    expect(screen.getAllByText('Create Service Package')[0]).toBeInTheDocument()
    
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    
    // Shows snackbar error for missing inputs
    await waitFor(() => {
      expect(screen.getByText('Package name must be at least 3 characters')).toBeInTheDocument()
    })
  })

  it('automatically shows particular brands when selecting vehicle type', async () => {
    render(<ServicesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Full Engine Tune')).toBeInTheDocument()
    })
    
    const newBtn = screen.getByRole('button', { name: /Create Package/i })
    fireEvent.click(newBtn)
    
    // Check modal open
    expect(screen.getAllByText('Create Service Package')[0]).toBeInTheDocument()
    
    // Initially shows Toyota in brand options/chips
    expect(screen.getByTestId('brand-chip-Toyota')).toBeInTheDocument()
    
    // Click on Motorcycle classification chip
    const bikeChip = screen.getByTestId('type-chip-BIKE')
    fireEvent.click(bikeChip)
    
    // Now motorcycle specific brands like Yamaha, Bajaj, TVS should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('brand-chip-Yamaha')).toBeInTheDocument()
      expect(screen.getByTestId('brand-chip-Bajaj')).toBeInTheDocument()
      expect(screen.getByTestId('brand-chip-TVS')).toBeInTheDocument()
    })
  })

  it('automatically filters and switches vehicle classification when selecting a brand', async () => {
    render(<ServicesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Full Engine Tune')).toBeInTheDocument()
    })
    
    const newBtn = screen.getByRole('button', { name: /Create Package/i })
    fireEvent.click(newBtn)
    
    // Click on Yamaha brand chip
    const yamahaChip = screen.getByTestId('brand-chip-Yamaha')
    fireEvent.click(yamahaChip)
    
    // Classification should automatically switch to Motorcycle / BIKE and label indicates Yamaha
    await waitFor(() => {
      expect(screen.getAllByText(/Vehicle Classification \(Yamaha\)/i)[0]).toBeInTheDocument()
    })
  })

  it('supports selecting multiple vehicle types and multiple brands simultaneously', async () => {
    render(<ServicesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Full Engine Tune')).toBeInTheDocument()
    })
    
    const newBtn = screen.getByRole('button', { name: /Create Package/i })
    fireEvent.click(newBtn)
    
    // Select Car
    fireEvent.click(screen.getByTestId('type-chip-CAR'))
    // Select SUV as well
    fireEvent.click(screen.getByTestId('type-chip-SUV'))
    
    // Both Car and SUV should be active
    // Select Toyota
    fireEvent.click(screen.getByTestId('brand-chip-Toyota'))
    // Select Nissan
    fireEvent.click(screen.getByTestId('brand-chip-Nissan'))
    
    // Both brands should be in the selection label
    await waitFor(() => {
      expect(screen.getAllByText(/Vehicle Classification \(Toyota, Nissan\)/i)[0]).toBeInTheDocument()
    })
  })
})
