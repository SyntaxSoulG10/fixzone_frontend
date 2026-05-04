import type { ServiceCenter } from "@/types/service-center";
import APP_CONFIG from "../config";

// Use centralized configuration
const BASE_URL = APP_CONFIG.API_BASE_URL;

// Retrieve auth token from localStorage and add to request headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Fetch all available service centers
export async function getServiceCenters(): Promise<ServiceCenter[]> {
  const res = await fetch(`${BASE_URL}/api/service-centers`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    throw new Error("Failed to load service centers");
  }

  return res.json();
}

// Get detailed info for a specific service center with timeout protection
export async function getServiceCenterDetails(centerId: string): Promise<any> {
  const controller = new AbortController();
  // Set 2 second timeout for safety
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${BASE_URL}/api/service-centers/${centerId}`, {
      signal: controller.signal,
      headers: {
        ...getAuthHeaders()
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error("Failed to load service center details");
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch all service packages available at a specific center
export async function getServicePackagesByCenter(centerId: string): Promise<any> {
  const controller = new AbortController();
  // Set 2 second timeout for safety
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    // Fixed: Correct endpoint path and removed double slash
    const res = await fetch(`${BASE_URL}/api/service-packages/center/${centerId}`, {
      signal: controller.signal,
      headers: {
        ...getAuthHeaders()
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error("Failed to load service packages");
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Create initial payment session without processing payment
export async function createPaymentSession(bookingId: number, amount: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ bookingId, amount }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to create payment session");
  }

  // The backend returns a plain text URL, not JSON
  return res.text();
}

// Initialize booking session - reserves a time slot and returns paymentId
export async function initPayment(servicePackageId: string, vehicleId: string, date: string, timeSlot: string, centerId: string, specialRequest: string = ""): Promise<number> {
  const res = await fetch(`${BASE_URL}/payments/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ servicePackageId, vehicleId, date, timeSlot, centerId, specialRequest }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    // Check for time slot conflict
    if (res.status === 409 || errorMsg.toLowerCase().includes("unavailable")) {
      throw new Error("TIME_SLOT_UNAVAILABLE");
    }
    throw new Error(errorMsg || "Failed to initialize booking session");
  }

  const data = await res.json();
  return data.paymentId;
}

// Process payment with Stripe - returns checkout URL
export async function executeStripePayment(paymentId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/payments/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ paymentId }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to create Stripe checkout session");
  }

  // Returns plain text Stripe URL
  return res.text();
}

// Verify successful Stripe payment completion using session ID
export async function verifyPaymentSuccess(sessionId: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/payments/success?session_id=${sessionId}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to verify payment success");
  }
  return res.text(); // Return plain text like "Payment updated successfully"
}

// Retrieve payment details for a booking
export async function getPaymentDetails(bookingId: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/payments/${bookingId}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to load payment details");
  }
  return res.json();
}

// Process refund for a booking
export async function refundPayment(bookingId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/payments/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to process refund");
  }
  return res.text();
}

// Reschedule payment for a new booking time
export async function reschedulePayment(bookingId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/payments/reschedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to reschedule payment");
  }
  return res.text(); // Should return the new Stripe checkout URL
}

// Fetch all bookings made by a specific customer
export async function getBookingsByCustomer(customerId: string): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/bookings/customer/${customerId}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    throw new Error("Failed to load customer bookings");
  }
  return res.json();
}

// Fetch all bookings across the entire system
export async function getAllBookings(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    throw new Error("Failed to load all bookings");
  }
  return res.json();
}

// Reschedule existing booking to new date and time
export async function rescheduleBookingAPI(bookingId: string, newDate: string, newTime: string): Promise<any> {
  const url = new URL(`${BASE_URL}/api/bookings/${bookingId}/reschedule`);
  url.searchParams.append("newDate", newDate);
  url.searchParams.append("newTime", newTime);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    let message = "Failed to reschedule booking";
    const rawText = await res.text().catch(() => "");
    try {
      const errorData = JSON.parse(rawText);
      message = errorData.message || errorData.error || message;
    } catch (e) {
      if (rawText) message = rawText;
    }
    return { error: true, message };
  }
  return res.json();
}

// Cancel booking - prevents further modifications
export async function cancelBookingAPI(bookingId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/cancel`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.message || "Failed to cancel booking";
    throw new Error(message);
  }
  return res.json();
}

// Open invoice PDF for download in new tab
export async function downloadInvoice(bookingId: string): Promise<void> {
  // Try to open invoice directly or fetch it
  window.open(`${BASE_URL}/api/invoices/booking/${bookingId}/download`, "_blank");
}

// Get all available time slots for a service center on specific date
export async function getAvailableSlotsAPI(centerId: string, date: string): Promise<string[]> {
  const url = new URL(`${BASE_URL}/api/bookings/available-slots`);
  url.searchParams.append("centerId", centerId);
  url.searchParams.append("date", date);

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    throw new Error("Failed to load available slots");
  }
  return res.json();
}
