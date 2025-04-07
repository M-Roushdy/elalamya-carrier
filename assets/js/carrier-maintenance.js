document.addEventListener('DOMContentLoaded', function() {
    const WORDPRESS_API_BASE = 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1';
    
    // 1. First update phone numbers
    updatePhoneNumbers();
    
    // 2. Then load blog posts into tabs
    loadBlogTabs();

    async function updatePhoneNumbers() {
        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/settings`);
            const settings = await response.json();
            
            document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
                el.href = `tel:${settings.phone}`;
                el.textContent = settings.phone; 
            });
            
            document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
                el.href = `https://wa.me/${settings.whatsapp}`;
                el.textContent = settings.whatsapp;
            });
        } catch (error) {
            console.error('Error updating phone numbers:', error);
        }
    }

    async function loadBlogTabs() {
        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/blogs?per_page=5`);
            const posts = await response.json();
            
            const tabsContainer = document.querySelector('#tabs .container');
            if (!tabsContainer) return;
            
            // Clear existing demo content but keep structure
            const navTabs = tabsContainer.querySelector('.nav-tabs');
            const tabContent = tabsContainer.querySelector('.tab-content');
            
            navTabs.innerHTML = '';
            tabContent.innerHTML = '';
            
            // Create tabs for each blog post
            posts.forEach((post, index) => {
                const isActive = index === 0 ? 'active show' : '';
                
                // Create tab nav item
                const tabNavItem = document.createElement('li');
                tabNavItem.className = 'nav-item';
                tabNavItem.innerHTML = `
                    <a class="nav-link ${isActive}" data-bs-toggle="tab" href="#tab-${post.id}">
                        ${post.title.substring(0, 15)}${post.title.length > 15 ? '...' : ''}
                    </a>
                `;
                navTabs.appendChild(tabNavItem);
                
                // Create tab content
                const tabPane = document.createElement('div');
                tabPane.className = `tab-pane fade ${isActive}`;
                tabPane.id = `tab-${post.id}`;
                tabPane.innerHTML = `
                    <div class="row">
                        <div class="col-lg-8 details order-2 order-lg-1">
                            <h3>${escapeHtml(post.title)}</h3>
                            <p class="fst-italic">${post.excerpt || ''}</p>
                            <div>${post.content}</div>
                        </div>
                        <div class="col-lg-4 text-center order-1 order-lg-2">
                            ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${escapeHtml(post.title)}" class="img-fluid">` : ''}
                        </div>
                    </div>
                `;
                tabContent.appendChild(tabPane);
            });
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
            document.getElementById('tabs').innerHTML = `
                <div class="container">
                    <div class="alert alert-warning">
                        Unable to load blog content. Please try again later.
                    </div>
                </div>
            `;
        }
    }

    // Helper function to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});