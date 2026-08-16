import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CompanyOwnerDashboard from '../app/dashboard/company-owner/page'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}))

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [
      { centerId: 'c1', name: 'Center A', address: 'Location A', contactPhone: '0771234567', isActive: true, revenue: 1000, mechanicsCount: 2, currentCapacity: 10 },
      { centerId: 'c2', name: 'Center B', address: 'Location B', contactPhone: '0777654321', isActive: false, revenue: 0, mechanicsCount: 0, currentCapacity: 0 }
    ],
    managersData: [],
    analyticsData: {
      totalRevenue: 25000,
      revenueChange: '+12%',
      totalJobs: 140,
      jobsChange: '+8%',
      topCenters: [],
      revenueOverview: []
    },
    statsData: {},
    customersData: [{ id: 'cust1' }, { id: 'cust2' }, { id: 'cust3' }],
    ownerData: { companyName: 'Apex Auto Group' },
    bookingsData: [],
    subscriptionsData: [],
    invoicesData: [],
    isLoading: false,
    hasDataInitialized: true,
    refreshCenters: vi.fn(),
    refreshManagers: vi.fn(),
    refreshAnalytics: vi.fn(),
    refreshBookings: vi.fn(),
    refreshInvoices: vi.fn(),
    refreshAll: vi.fn(),
  })
}))

// Mock Recharts to avoid JS-DOM canvas warnings
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
}))

// Mock Chart.js component
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}))

describe('Company Owner Dashboard Main Page', () => {
  it('renders the owner company name header', () => {
    render(<CompanyOwnerDashboard />)
    expect(screen.getByText('Apex Auto Group Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back! Manage your service centers and track performance.')).toBeInTheDocument()
  })

  it('renders stats grid correctly with mocked counts', () => {
    render(<CompanyOwnerDashboard />)
    
    // Revenue formatted as Rs. 25,000
    expect(screen.getByText('Rs. 25,000')).toBeInTheDocument()
    
    // Active centers count (c1 has isActive=true)
    expect(screen.getByText('1')).toBeInTheDocument()
    
    // Total customers count (customers array has length 3)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders tabs and changes active tab on click', () => {
    render(<CompanyOwnerDashboard />)
    
    const overviewTab = screen.getByRole('tab', { name: /overview/i })
    const performanceTab = screen.getByRole('tab', { name: /performance/i })
    
    expect(overviewTab).toBeInTheDocument()
    expect(performanceTab).toBeInTheDocument()
    
    // Click performance tab
    fireEvent.click(performanceTab)
    
    // Tab changes
    expect(performanceTab.getAttribute('aria-selected')).toBe('true')
  })

  it('contains quick action links with correct routes', () => {
    render(<CompanyOwnerDashboard />)
    
    expect(screen.getByRole('heading', { name: 'Service Reports' }).closest('a')).toHaveAttribute('href', '/dashboard/company-owner/reports')
    expect(screen.getByRole('heading', { name: 'Create Service Center' }).closest('a')).toHaveAttribute('href', '/dashboard/company-owner/centers')
    expect(screen.getByRole('heading', { name: 'Manage Services' }).closest('a')).toHaveAttribute('href', '/dashboard/company-owner/services')
  })
})
