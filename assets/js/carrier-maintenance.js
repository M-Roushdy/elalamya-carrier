document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from WordPress REST API
    fetchCarrierData();
    
    // You can also set up periodic refreshes if needed
    // setInterval(fetchCarrierData, 60000); // Refresh every minute
});

function fetchCarrierData() {
    // Get both settings and departments in parallel
    Promise.all([
        fetch('/wp-json/carrier/v1/settings').then(res => res.json()),
        fetch('/wp-json/carrier/v1/departments').then(res => res.json())
    ])
    .then(([settings, departments]) => {
        // Update phone numbers
        updatePhoneNumbers(settings);
        
        // Update departments
        updateDepartments(departments);
    })
    .catch(error => {
        console.error('Error fetching Carrier data:', error);
    });
}

function updatePhoneNumbers(settings) {
    // Update phone number elements
    const phoneElements = document.querySelectorAll('[data-carrier="phone"]');
    const whatsappElements = document.querySelectorAll('[data-carrier="whatsapp"]');
    
    phoneElements.forEach(el => {
        if (el.tagName === 'A' && el.href.startsWith('tel:')) {
            el.href = `tel:${settings.phone}`;
        }
        el.textContent = settings.phone;
    });
    
    whatsappElements.forEach(el => {
        if (el.tagName === 'A' && el.href.startsWith('https://wa.me/')) {
            el.href = `https://wa.me/${settings.whatsapp}`;
        }
        el.textContent = settings.whatsapp;
    });
}

function updateDepartments(departments) {
    const container = document.getElementById('departments-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add new departments
    departments.forEach(dept => {
        const deptElement = document.createElement('div');
        deptElement.className = 'department';
        deptElement.innerHTML = `
            <h3>${escapeHtml(dept.title)}</h3>
            <div>${dept.content}</div>
        `;
        container.appendChild(deptElement);
    });
}

// Simple HTML escaping for security
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}