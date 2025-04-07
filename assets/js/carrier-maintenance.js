document.addEventListener('DOMContentLoaded', function() {
    const WORDPRESS_API_BASE = 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1';
    
    // Update contact sections and blog tabs
    updateContactSections();
    loadBlogTabs();

    async function updateContactSections() {
        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/settings`);
            if (!response.ok) throw new Error('Failed to fetch settings');
            
            const { phone, whatsapp } = await response.json();
            
            // Update phone links with Arabic text
            document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
                if (el) {
                    el.innerHTML = `للتواصل على هاتفنا <span class="phone-number">${phone}</span>`;
                    el.href = `tel:${phone}`;
                }
            });
            
            // Update WhatsApp links with Arabic text
            document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
                if (el) {
                    el.innerHTML = `للتواصل على الواتساب <span class="whatsapp-number">${whatsapp}</span>`;
                    el.href = `https://wa.me/${whatsapp}`;
                }
            });
            
        } catch (error) {
            console.error('Error updating contact info:', error);
        }
    }

    async function loadBlogTabs() {
        try {
            const tabsSection = document.getElementById('tabs');
            if (!tabsSection) {
                console.warn('Tabs section not found');
                return;
            }
            
            const response = await fetch(`${WORDPRESS_API_BASE}/blogs?per_page=5`);
            if (!response.ok) throw new Error('Failed to fetch blogs');
            
            const posts = await response.json();
            if (!posts?.length) {
                console.warn('No blog posts available');
                return;
            }
            
            const navTabs = tabsSection.querySelector('.nav-tabs');
            const tabContent = tabsSection.querySelector('.tab-content');
            
            if (!navTabs || !tabContent) {
                console.warn('Tab containers not found');
                return;
            }
            
            // Clear existing tabs
            navTabs.innerHTML = '';
            tabContent.innerHTML = '';
            
            // Create new tabs from WordPress posts
            posts.forEach((post, index) => {
                const isActive = index === 0 ? 'active show' : '';
                
                // Tab header
                const tabNavItem = document.createElement('li');
                tabNavItem.className = 'nav-item';
                tabNavItem.innerHTML = `
                    <a class="nav-link ${isActive}" data-bs-toggle="tab" href="#tab-${post.id}">
                        ${truncateText(post.title, 15)}
                    </a>
                `;
                navTabs.appendChild(tabNavItem);
                
                // Tab content
                const tabPane = document.createElement('div');
                tabPane.className = `tab-pane fade ${isActive}`;
                tabPane.id = `tab-${post.id}`;
                tabPane.innerHTML = `
                    <div class="row">
                        <div class="col-lg-8 details order-2 order-lg-1">
                            <h3>${escapeHtml(post.title)}</h3>
                            ${post.excerpt ? `<p class="fst-italic">${escapeHtml(post.excerpt)}</p>` : ''}
                            <div class="blog-content">${post.content || ''}</div>
                        </div>
                        <div class="col-lg-4 text-center order-1 order-lg-2">
                            ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${escapeHtml(post.title)}" class="img-fluid blog-image">` : ''}
                        </div>
                    </div>
                `;
                tabContent.appendChild(tabPane);
            });
            
        } catch (error) {
            console.error('Error loading blogs:', error);
            showError('تعذر تحميل المقالات. يرجى المحاولة لاحقاً.');
        }
    }

    function showError(message) {
        const tabsSection = document.getElementById('tabs');
        if (tabsSection) {
            tabsSection.innerHTML = `
                <div class="container">
                    <div class="alert alert-warning text-center py-3">
                        ${message}
                    </div>
                </div>
            `;
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength 
            ? escapeHtml(text.substring(0, maxLength)) + '...' 
            : escapeHtml(text);
    }
});