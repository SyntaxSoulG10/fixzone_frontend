/**
 * enrichBookingsWithCenterNames
 *
 * The backend's BookingResponseDTO should include serviceCenterName and
 * centerAddress, but if those fields come back null/empty we fall back to
 * looking up the center from the /api/service-centers list.
 *
 * Call this after fetching bookings anywhere in the app.
 */
import { getServiceCenters } from "@/lib/api";

export async function enrichBookingsWithCenterNames(bookings: any[]): Promise<any[]> {
  if (!bookings?.length) return bookings ?? [];

  // If every booking already has a non-empty name, skip the extra fetch
  const allHaveNames = bookings.every(
    (b) => b.serviceCenterName && b.serviceCenterName.trim() !== ""
  );
  if (allHaveNames) return bookings;

  try {
    const centers = await getServiceCenters();
    const centerMap = new Map(
      (centers || []).map((c: any) => [String(c.centerId), c])
    );

    return bookings.map((b) => {
      // Try every field the backend might use for the center reference
      const cid =
        b.centerId ??
        b.serviceCenterId ??
        b.stationId ??
        b.center?.centerId ??
        b.center?.id ??
        b.serviceCenter?.centerId ??
        b.serviceCenter?.id;

      const center = cid ? centerMap.get(String(cid)) : undefined;

      return {
        ...b,
        serviceCenterName:
          (b.serviceCenterName && b.serviceCenterName.trim()) ||
          b.serviceCenter?.name ||
          center?.name ||
          "Service Center",
        centerAddress:
          (b.centerAddress && b.centerAddress.trim()) ||
          b.serviceCenter?.address ||
          center?.address ||
          "",
      };
    });
  } catch {
    // If the centers fetch fails, return bookings as-is
    return bookings;
  }
}
