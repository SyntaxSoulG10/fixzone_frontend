export type ServiceCenter = {
  centerId: string;
  ownerId: string | null;
  name: string;
  address: string | null;
  contactPhone: string | null;
  openingHours: string | null;
  rating: number | null;
  isActive: boolean | null;
  supportedVehicleBrands: string[] | null;
  status?: string | null;
  googleMapsUrl?: string | null;
  imageUrl?: string | null;
  paymentEnabled?: boolean | null;
  stripeConnected?: boolean | null;
  stripeConnectEnabled?: boolean | null;
  canAcceptPayments?: boolean | null;
  latitude?: number;
  longitude?: number;
  servicePackages?: {
    packageId: string;
    name: string;
    type: string | null;
    vehicleType: string | null;
  }[];
};