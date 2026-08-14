import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CustomersPage from '../app/dashboard/company-owner/customers/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) })
}))

// Mock DataGrid to prevent jsdom layout calculation loops
vi.mock('@/components/dashboard/StatCard', () => ({
  default: ({ title, count }: any) => (
    <div data-testid="stat-card">
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
  )
}))

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: any) => (
    <table data-testid="mock-datagrid">
      <thead>
        <tr>
          {columns.map((c: any) => <th key={c.field}>{c.headerName}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r: any, idx: number) => (
          <tr key={r.id || idx}>
            {columns.map((c: any) => {
              const cellContent = c.renderCell ? c.renderCell({ row: r, value: r[c.field] }) : r[c.field];
              return <td key={c.field}>{cellContent}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}))

const mockCustomers = [
  { userId: 'cust1', fullName: 'Amal Perera', email: 'amal@gmail.com', visits: 5, totalSpent: 15000, lastLoginAt: '2026-07-15T10:00:00Z', status: 'VIP' },
  { userId: 'cust2', fullName: 'Nimal Silva', email: 'nimal@gmail.com', visits: 1, totalSpent: 2500, lastLoginAt: '2026-07-18T10:00:00Z', status: 'New' }
]

const mockRefreshAll = vi.fn()
const mockAnalyticsData = {}

// Mock context hook
let mockIsLoading = false
vi.mock('@/context/DashboardDataContext', () => ({
  useDashboardData: () => ({
    customersData: mockCustomers,
    analyticsData: mockAnalyticsData,
    isLoading: mockIsLoading,
    refreshAll: mockRefreshAll
  })
}))

describe('Company Owner Customers Tab Page', () => {
  it('renders customers metrics and datagrid headers', () => {
    render(<CustomersPage />)
    
    // Check main headings
    expect(screen.getByText('Customers')).toBeInTheDocument()
    
    // Check stat cards
    expect(screen.getByText('Total Customers')).toBeInTheDocument()
    expect(screen.getByText('Repeat Customers')).toBeInTheDocument()
  })

  it('renders customers grid rows details', () => {
    render(<CustomersPage />)
    
    // Check if customer details are in datagrid
    expect(screen.getByText('Amal Perera')).toBeInTheDocument()
    expect(screen.getByText('nimal@gmail.com')).toBeInTheDocument()
  })

  it('calculates repeat customer rate percentage correctly', () => {
    render(<CustomersPage />)
    
    // 1 out of 2 customers has visits > 1, so repeat customer rate is 50%
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('formats total spent currency correctly as Rs.', () => {
    render(<CustomersPage />)
    
    expect(screen.getByText('Rs. 15,000')).toBeInTheDocument()
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument()
  })
})
