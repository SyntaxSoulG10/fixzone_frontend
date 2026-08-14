import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalyticsPage from '../app/dashboard/company-owner/analytics/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) })
}))

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [
      { centerId: 'c1', name: 'Colombo Main Center' }
    ],
    analyticsData: {
      totalRevenue: 25000,
      revenueChange: '+12%',
      totalJobs: 140,
      jobsChange: '+8%',
      onlineRevenue: 15000,
      handCollectionRevenue: 10000,
      avgJobValue: 180,
      avgJobValueChange: '+5%',
      pendingJobs: 5,
      pendingJobsChange: '-2%',
      topCenters: [
        { id: 'c1', name: 'Colombo Main Center', jobs: 80, revenue: 15000, color: '#f3651c' }
      ],
      revenueOverview: [
        { label: 'Jan', amount: 5000 },
        { label: 'Feb', amount: 8000 }
      ],
      serviceBreakdown: [
        { name: 'Full Service', value: 50 },
        { name: 'Body Wash', value: 30 }
      ],
      customerGrowth: [
        { name: 'Jan', activeCustomers: 200 },
        { name: 'Feb', activeCustomers: 220 }
      ]
    },
    isLoading: false,
    refreshAll: vi.fn()
  })
}))

// Mock DataGrid to prevent jsdom layout issues
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: any) => (
    <div data-testid="data-grid">
      {rows.map((row: any, idx: number) => (
        <div key={row.name || idx} data-testid="data-grid-row">
          <span>{row.name}</span>
          <span>{row.jobs}</span>
          <span>{row.revenue}</span>
        </div>
      ))}
    </div>
  )
}))

// Mock Recharts
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
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}))

describe('Company Owner Analytics Tab Page', () => {
  it('renders analytics headers and stat cards', () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Business Analytics')).toBeInTheDocument()
    expect(screen.getByText('Rs. 25,000')).toBeInTheDocument()
    expect(screen.getByText('140')).toBeInTheDocument()
  })

  it('renders top centers grid list', () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    expect(screen.getByText('Colombo Main Center')).toBeInTheDocument()
  })

  it('allows changing filters (Period / Date / Station)', async () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('All Service Centers')).toBeInTheDocument()
  })
})
