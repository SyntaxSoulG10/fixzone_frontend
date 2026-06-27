/**
 * Derived API endpoint map.
 * All paths are built from NEXT_PUBLIC_API_BASE_URL so there is one source of truth.
 * Import APP_CONFIG from "@/utils/config" wherever you need a specific endpoint URL.
 */
const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

export const APP_CONFIG = {
  api: {
    baseUrl:        `${BASE}/api`,
    serviceCenters: `${BASE}/api/service-centers`,
    customers:      `${BASE}/api/customers`,
    customer:       `${BASE}/api/customer`,        // singular — profile, vehicles, settings
    managers:       `${BASE}/api/managers`,
    paymentRecords: `${BASE}/api/payment-records`,
    invoices:       `${BASE}/api/invoices`,
    analytics:      `${BASE}/api/analytics`,
    owners:         `${BASE}/api/owners`,
    superAdmins:    `${BASE}/api/super-admins`,
    auth:           `${BASE}/api/auth`,
    bookings:       `${BASE}/api/bookings`,
    payments:       `${BASE}/api/payments`,
    subscriptions:  `${BASE}/api/subscriptions`,
    subPlans:       `${BASE}/api/subscription-plans`,
  },
  placeholders: {
    ownerId: "00000000-0000-0000-0000-000000010011",
  },
};
