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
};

