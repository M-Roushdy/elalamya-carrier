/**
 * Carrier Maintenance Client
 * Version: 2.0
 */
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        API_URL: 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1/settings',
        API_KEY: 'carrier_7a9b3f2d5e8c1b6a4d9f', // Must match PHP secret
        CACHE_KEY: 'carrier_numbers',
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
        
        // Fetch fresh data
        const response = await fetch(CONFIG.API_URL, {
            headers: {
                'X-Carrier-Auth': CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response
        if (!data || !data.carrier_phone || !data.carrier_whatsapp) {
            throw new Error('Invalid API response');
        }
        
        // Cache the result
        cacheNumbers(data);
        
        return data;
    }

    function updateContactElements(numbers) {
        // Phone numbers
        document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
            el.href = `tel:${numbers.carrier_phone}`;
            el.textContent = el.textContent.replace(/\d+/, numbers.carrier_phone);
        });
        
        // WhatsApp numbers
        document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
            el.href = `https://wa.me/${numbers.carrier_whatsapp}`;
            el.textContent = el.textContent.replace(/\d+/, numbers.carrier_whatsapp);
        });
    }

    function getCachedNumbers() {
        try {
            const stored = localStorage.getItem(CONFIG.CACHE_KEY);
            if (!stored) return null;
            
            const { data, timestamp } = JSON.parse(stored);
            
            if (Date.now() - timestamp < CONFIG.CACHE_TTL) {
                return data;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function cacheNumbers(data) {
        try {
            localStorage.setItem(
                CONFIG.CACHE_KEY,
                JSON.stringify({
                    data: data,
                    timestamp: Date.now()
                })
            );
        } catch (e) {
            console.warn('Failed to cache numbers:', e);
        }
    }

    function fallbackToCache() {
        const cached = getCachedNumbers();
        if (cached) {
            updateContactElements(cached);
        }
    }
});