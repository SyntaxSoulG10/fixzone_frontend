import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";

export const updateServiceLanesCount = async (centerId: string, lanesCount: number) => {
    const response = await axios.patch(`${APP_CONFIG.api.serviceCenters}/${centerId}/lanes`, {
        serviceLanesCount: lanesCount
    });
    return response.data;
};

export const getServiceCenterById = async (centerId: string) => {
    const response = await axios.get(`${APP_CONFIG.api.serviceCenters}/${centerId}`);
    return response.data;
};

export const getCurrentServiceCenters = async () => {
    const response = await axios.get(`${APP_CONFIG.api.serviceCenters}/current`);
    return response.data;
};
