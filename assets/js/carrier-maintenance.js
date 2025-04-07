/**
 * Carrier Maintenance Client - Multi-Domain
 * Version: 3.0
 */
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        API_URL: 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1/settings',
        API_KEY: 'carrier_7a9b3f2d5e8c1b6a4d9f',
        CACHE_KEY: 'carrier_numbers_v3',
        CACHE_TTL: 3600000, // 1 hour
        MAX_RETRIES: 3
    };

    // Main execution flow
    init();
    
    async function init() {
        try {
            const numbers = await getPhoneNumbers();
            updateContactElements(numbers);
        } catch (error) {
            console.error('Carrier Maintenance Error:', error.message);
            fallbackToCache();
        }
    }

    async function getPhoneNumbers() {
        // Try cache first
        const cached = getCachedNumbers();
        if (cached) return cached;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'X-Carrier-Auth': CONFIG.API_KEY,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data?.carrier_phone || !data?.carrier_whatsapp) {
                throw new Error('Invalid response format');
            }
            
            cacheNumbers(data);
            return data;
            
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    function updateContactElements(numbers) {
        // Phone numbers
        document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
            if (el instanceof HTMLAnchorElement) {
                el.href = `tel:${numbers.carrier_phone}`;
                const currentText = el.textContent;
                const newText = currentText.replace(/\d+/, numbers.carrier_phone);
                el.textContent = newText;
            }
        });
        
        // WhatsApp numbers
        document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
            if (el instanceof HTMLAnchorElement) {
                el.href = `https://wa.me/${numbers.carrier_whatsapp}`;
                const currentText = el.textContent;
                const newText = currentText.replace(/\d+/, numbers.carrier_whatsapp);
                el.textContent = newText;
            }
        });
    }

    // ... [Keep remaining cache functions from previous version] ...
});