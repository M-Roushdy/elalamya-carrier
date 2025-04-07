/**
 * Carrier Maintenance Client with CORS Fix
 * Version: 2.1
 */
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        API_URL: 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1/settings',
        API_KEY: 'carrier_7a9b3f2d5e8c1b6a4d9f',
        CACHE_KEY: 'carrier_numbers_v2',
        CACHE_TTL: 3600000 // 1 hour
    };

    // Main execution flow
    init();
    
    async function init() {
        try {
            const numbers = await getPhoneNumbers();
            updateContactElements(numbers);
        } catch (error) {
            console.error('Carrier Maintenance Error:', error);
            fallbackToCache();
        }
    }

    async function getPhoneNumbers() {
        // Try cache first
        const cached = getCachedNumbers();
        if (cached) return cached;
        
        // Configure CORS request
        const corsOptions = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'X-Carrier-Auth': CONFIG.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        try {
            const response = await fetchWithRetry(CONFIG.API_URL, corsOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate response structure
            if (!data || !data.carrier_phone || !data.carrier_whatsapp) {
                throw new Error('Invalid API response format');
            }
            
            // Cache the result
            cacheNumbers(data);
            
            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    async function fetchWithRetry(url, options, retries = 3) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying... ${retries} attempts left`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithRetry(url, options, retries - 1);
            }
            throw error;
        }
    }

    // ... [Keep the remaining functions from previous version unchanged] ...
});