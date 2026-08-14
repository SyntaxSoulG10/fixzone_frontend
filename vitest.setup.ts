import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock browser APIs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
    },
    writable: true
  })
}

const mockAnalyticsPayload = {
  totalRevenue: 25000,
  revenueChange: '+12%',
  totalJobs: 140,
  jobsChange: '+8%',
  handCollectionRevenue: 10000,
  onlineRevenue: 15000,
  avgJobValue: 180,
  avgJobValueChange: '+5%',
  pendingJobs: 5,
  pendingJobsChange: '-2%',
  topCenters: [
    { id: 'c1', name: 'Colombo Main Center', jobs: 80, revenue: 15000, color: '#f3651c' }
  ],
  revenueOverview: [
    { name: 'Jan', revenue: 5000, onlineRevenue: 3000, handCollectionRevenue: 2000 },
    { name: 'Feb', revenue: 8000, onlineRevenue: 5000, handCollectionRevenue: 3000 }
  ],
  serviceBreakdown: [
    { name: 'Full Service', value: 50 },
    { name: 'Body Wash', value: 30 }
  ],
  customerGrowth: [
    { name: 'Jan', activeCustomers: 200 },
    { name: 'Feb', activeCustomers: 220 }
  ],
  recentTransactions: [
    { id: 't1', customer: 'John Doe', amount: 5000, method: 'CASH', status: 'PAID', date: '2026-05-10' }
  ]
}

// Global Axios Mock
vi.mock('@/lib/axios', () => {
  return {
    default: {
      get: vi.fn().mockImplementation((url) => {
        if (url.includes('/analytics') || url.includes('/current')) {
          return Promise.resolve({
            data: mockAnalyticsPayload
          })
        }
        if (url.includes('/packages')) {
          return Promise.resolve({
            data: [
              { id: 'pkg1', centerId: 'c1', name: 'Full Engine Tune', description: 'Complete engine tuning and spark plugs replacement.', price: 7500, duration: 90, features: ['Oil change', 'Filter replacement'], isActive: true }
            ]
          })
        }
        return Promise.resolve({ data: [] })
      }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }
  }
})

// Global Analytics Service Mock
vi.mock('@/services/analyticsService', () => ({
  getCurrentOwnerAnalytics: vi.fn().mockResolvedValue(mockAnalyticsPayload),
  getCompanyAnalytics: vi.fn().mockResolvedValue(mockAnalyticsPayload)
}))
