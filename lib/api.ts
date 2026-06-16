import type { ServiceCenter } from "@/types/service-center";
import APP_CONFIG from "../config";

// Use centralized configuration
const BASE_URL = APP_CONFIG.API_BASE_URL;

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

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

export async function getServiceCenterDetails(centerId: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

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

export async function getServicePackagesByCenter(centerId: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

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

/**
 * Step 1: Initialize a booking session and reserve a slot.
 * Returns the generated paymentId.
 */
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
    if (res.status === 409 || errorMsg.toLowerCase().includes("unavailable")) {
      throw new Error("TIME_SLOT_UNAVAILABLE");
    }
    throw new Error(errorMsg || "Failed to initialize booking session");
  }

  const data = await res.json();
  return data.paymentId;
}

/**
 * Step 2: Execute Stripe payment for the initialized session.
 * Returns a plain text Stripe Checkout URL.
 */
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

export async function downloadInvoice(bookingId: string): Promise<void> {
  // Try to open invoice directly or fetch it
  window.open(`${BASE_URL}/api/invoices/booking/${bookingId}/download`, "_blank");
}

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

/**
 * --- Admin/Subscription API ---
 */

export async function fetchSubscriptions(status?: string): Promise<any[]> {
  const url = new URL(`${BASE_URL}/api/admin/subscriptions`);
  if (status && status !== 'ALL') {
    url.searchParams.append("status", status);
  }

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    throw new Error("Failed to load subscriptions");
  }

  return res.json();
}

// Subscription Plans API
export async function getSubscriptionPlans(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/subscription-plans`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to load subscription plans");
  return res.json();
}

export async function createSubscriptionPlan(plan: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/subscription-plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(plan)
  });
  if (!res.ok) throw new Error("Failed to create subscription plan");
  return res.json();
}

export async function updateSubscriptionPlan(id: string, plan: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/subscription-plans/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(plan)
  });
  if (!res.ok) throw new Error("Failed to update subscription plan");
  return res.json();
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/subscription-plans/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to delete subscription plan");
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string): Promise<any> {
  const url = new URL(`${BASE_URL}/api/admin/subscriptions/${subscriptionId}/status`);
  url.searchParams.append("status", status);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Failed to update subscription status");
  }

  return res.json();
}

export async function getNotifications(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }
  return res.json();
}

export async function markNotificationAsRead(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error("Failed to mark notification as read");
  }
  return res.json();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error("Failed to delete notification");
  }
}
