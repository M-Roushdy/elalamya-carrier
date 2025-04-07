/**
 * Carrier Maintenance - Dynamic Content Loader
 * Version: 1.0
 * Author: Your Name
 */
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        WORDPRESS_API_BASE: 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1',
        CACHE_TTL: 300000, // 5 minutes in milliseconds
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000
    };

    // Main initialization
    init();

    function init() {
        updateContactInfo().catch(handleError);
    }

    async function updateContactInfo(retryCount = 0) {
        try {
            const response = await fetchWithTimeout(
                `${CONFIG.WORDPRESS_API_BASE}/settings`,
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { success, data } = await response.json();
            
            if (!success || !data) {
                throw new Error('Invalid API response format');
            }

            updatePhoneElements(data.phone, data.whatsapp);
            setLocalStorage(data);

        } catch (error) {
            if (retryCount < CONFIG.MAX_RETRIES) {
                console.warn(`Retry ${retryCount + 1} after error:`, error.message);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                return updateContactInfo(retryCount + 1);
            }
            throw error;
        }
    }

    function updatePhoneElements(phone, whatsapp) {
        try {
            // Phone elements
            const phoneElements = document.querySelectorAll('[data-carrier="phone"]');
            phoneElements.forEach(el => {
                if (el instanceof HTMLAnchorElement) {
                    el.href = `tel:${phone}`;
                    // Preserve existing text structure, only replace numbers
                    el.innerHTML = el.innerHTML.replace(/\d+/g, phone);
                }
            });

            // WhatsApp elements
            const whatsappElements = document.querySelectorAll('[data-carrier="whatsapp"]');
            whatsappElements.forEach(el => {
                if (el instanceof HTMLAnchorElement) {
                    el.href = `https://wa.me/${whatsapp}`;
                    // Preserve existing text structure, only replace numbers
                    el.innerHTML = el.innerHTML.replace(/\d+/g, whatsapp);
                }
            });

        } catch (error) {
            console.error('Error updating DOM elements:', error);
            throw error;
        }
    }

    function setLocalStorage(data) {
        try {
            localStorage.setItem('carrier_settings', JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to set localStorage:', error);
        }
    }

    function getLocalStorage() {
        try {
            const cached = localStorage.getItem('carrier_settings');
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CONFIG.CACHE_TTL) {
                return data;
            }
            return null;
        } catch (error) {
            console.warn('Failed to get localStorage:', error);
            return null;
        }
    }

    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 8000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        
        clearTimeout(id);
        
        return response;
    }

    function handleError(error) {
        console.error('Carrier Maintenance Error:', error);
        
        // Try fallback to cached data
        const cachedData = getLocalStorage();
        if (cachedData) {
            console.log('Using cached phone data');
            updatePhoneElements(cachedData.phone, cachedData.whatsapp);
        } else {
            console.warn('No cached data available');
        }
        
        // Optional: Display error to user
        // const errorElement = document.getElementById('carrier-error');
        // if (errorElement) {
        //     errorElement.textContent = 'حدث خطأ في تحديث معلومات الاتصال';
        //     errorElement.style.display = 'block';
        // }
    }
});