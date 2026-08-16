"use client";
import { useEffect } from 'react';
import APP_CONFIG from '@/config';

export default function FetchInterceptor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        let [resource, config] = args;
        
        // Check if the request is going to our backend API
        const urlStr = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;
        
        if (urlStr.startsWith(APP_CONFIG.API_BASE_URL)) {
          config = config || {};
          // Ensure credentials are included to send the HttpOnly cookie
          config.credentials = 'include';
          
          // You can also ensure Authorization header is NOT sent if you strictly want cookies
          // But sending both won't hurt if backend accepts either
        }
        
        return originalFetch(resource, config);
      };
    }
  }, []);

  return null;
}
