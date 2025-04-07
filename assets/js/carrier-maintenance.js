/**
 * Carrier Maintenance Client - Complete Version
 * Version: 4.0
 */
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        API_URL: 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1/settings',
        CACHE_KEY: 'carrier_numbers_v5',
        CACHE_TTL: 3600000, // 1 hour
        FALLBACK_NUMBERS: {
            carrier_phone: '01112986699',
            carrier_whatsapp: '01112986655'
        }
    };

    // Initialize the application
    init();

    async function init() {
        try {
            const numbers = await getPhoneNumbers();
            updateContactElements(numbers);
        } catch (error) {
            console.error('Carrier Maintenance Error:', error);
            useFallbackNumbers();
        }
    }

    async function getPhoneNumbers() {
        // Try cache first
        const cached = getCachedNumbers();
        if (cached) return cached;
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const { success, data } = await response.json();
            
            if (!success || !data?.carrier_phone || !data?.carrier_whatsapp) {
                throw new Error('Invalid API response format');
            }
            
            cacheNumbers(data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
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
            console.warn('Cache read failed:', e);
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
            console.warn('Cache write failed:', e);
        }
    }

    function updateContactElements(numbers) {
        // Update phone links
        document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
            if (el instanceof HTMLAnchorElement) {
                el.href = `tel:${numbers.carrier_phone}`;
                const currentText = el.textContent;
                const newText = currentText.replace(/\d+/, numbers.carrier_phone);
                el.textContent = newText;
            }
        });
        
        // Update WhatsApp links
        document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
            if (el instanceof HTMLAnchorElement) {
                el.href = `https://wa.me/${numbers.carrier_whatsapp}`;
                const currentText = el.textContent;
                const newText = currentText.replace(/\d+/, numbers.carrier_whatsapp);
                el.textContent = newText;
            }
        });
    }

    function useFallbackNumbers() {
        updateContactElements(CONFIG.FALLBACK_NUMBERS);
    }
});