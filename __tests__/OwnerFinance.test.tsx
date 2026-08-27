import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FinancePage from '../app/dashboard/company-owner/finance/page'

// Mock context hook
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    centersData: [{ centerId: 'c1', name: 'Colombo Main Center' }],
    analyticsData: {
      totalRevenue: 25000,
      onlineRevenue: 15000,
      handCollectionRevenue: 10000,
      avgJobValue: 180,
      topCenters: [{ name: 'Colombo Main Center', jobs: 80, revenue: 15000 }],
      revenueOverview: [{ name: 'Jan', revenue: 5000, onlineRevenue: 3000, handCollectionRevenue: 2000 }],
      recentTransactions: [{ id: 't1', customer: 'John Doe', amount: 5000, method: 'CASH', status: 'PAID', date: '2026-05-10' }]
    },
    invoicesData: [
      { invoiceId: 'inv1', status: 'PAID', centerId: 'c1', total: 5000, issuedToCustomerId: 'cust1' }
    ],
    customersData: [{ userId: 'cust1', fullName: 'John Doe' }],
    isLoading: false,
    refreshAll: vi.fn()
  })
}))

// Mock DataGrid
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: any) => (
    <div data-testid="data-grid">
      {rows.map((row: any, idx: number) => (
        <div key={row.id || idx} data-testid="data-grid-row">
          <span>{row.id}</span>
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
}))

describe('Company Owner Finance Tab Page', () => {
  it('renders finance header and earnings stat cards', () => {
    render(<FinancePage />)
    
    expect(screen.getByText('Finance & Revenue')).toBeInTheDocument()
    expect(screen.getByText(/Track earnings and financial health/i)).toBeInTheDocument()
    
    // Check earnings metric box
    expect(screen.getByText('Rs. 25,000')).toBeInTheDocument()
  })

  it('renders branch financial performance and revenue share table', () => {
    render(<FinancePage />)
    
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    expect(screen.getByText('Colombo Main Center')).toBeInTheDocument()
    expect(screen.getByText('Branch Financial Performance & Revenue Share')).toBeInTheDocument()
  })
})

