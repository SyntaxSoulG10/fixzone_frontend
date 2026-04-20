export const APP_CONFIG = {
    // We encapsulate the API base URLs to avoid scattering raw strings throughout the frontend.
    // This allows for central updates if the backend host ever changes.
    api: {
        serviceCenters: "http://localhost:8081/api/service-centers",
        customers: "http://localhost:8081/api/customers",
        managers: "http://localhost:8081/api/managers",
        paymentRecords: "http://localhost:8081/api/payment-records",
        invoices: "http://localhost:8081/api/invoices",
    },
    // Adding placeholder IDs to resolve arbitrary hardcoded assignments
    placeholders: {
        ownerId: "00000000-0000-0000-0000-000000010011"
    }
};
