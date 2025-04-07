document.addEventListener('DOMContentLoaded', function() {
    const WORDPRESS_API_BASE = 'https://aliceblue-rabbit-873105.hostingersite.com/wp-json/carrier/v1';
    let currentBlogPage = 1;
    
    // Fetch initial data
    fetchData();
    
    // Set up blog pagination if exists
    document.getElementById('load-more-blogs')?.addEventListener('click', loadMoreBlogs);
    
    async function fetchData() {
        try {
            const [settings, blogs] = await Promise.all([
                fetch(`${WORDPRESS_API_BASE}/settings`).then(res => res.json()),
                fetch(`${WORDPRESS_API_BASE}/blogs?per_page=3`).then(res => res.json())
            ]);
            
            updatePhoneNumbers(settings);
            renderBlogPosts(blogs.posts);
            
            // Show/hide load more button
            if (document.getElementById('load-more-blogs')) {
                document.getElementById('load-more-blogs').style.display = 
                    currentBlogPage < blogs.pages ? 'block' : 'none';
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
            showError();
        }
    }
    
    async function loadMoreBlogs() {
        currentBlogPage++;
        try {
            const response = await fetch(
                `${WORDPRESS_API_BASE}/blogs?per_page=3&page=${currentBlogPage}`
            );
            const data = await response.json();
            
            renderBlogPosts(data.posts, true);
            
            // Hide button if no more posts
            if (currentBlogPage >= data.pages) {
                document.getElementById('load-more-blogs').style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading more blogs:', error);
            currentBlogPage--; // Revert page count on error
        }
    }
    
    function updatePhoneNumbers(settings) {
        document.querySelectorAll('[data-carrier="phone"]').forEach(el => {
            el.href = `tel:${settings.phone}`;
            el.textContent = settings.phone;
        });
        
        document.querySelectorAll('[data-carrier="whatsapp"]').forEach(el => {
            el.href = `https://wa.me/${settings.whatsapp}`;
            el.textContent = settings.whatsapp;
        });
    }
    
    function renderBlogPosts(posts, append = false) {
        const container = document.getElementById('blogs-container');
        if (!container) return;
        
        if (!append) {
            container.innerHTML = '';
        }
        
        posts.forEach(post => {
            const blogElement = document.createElement('article');
            blogElement.className = 'blog-post';
            blogElement.innerHTML = `
                <div class="blog-thumbnail">
                    ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${escapeHtml(post.title)}">` : ''}
                </div>
                <div class="blog-content">
                    <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
                    <div class="blog-meta">Posted on ${post.date}</div>
                    <div class="blog-excerpt">${post.excerpt || ''}</div>
                    <a href="${post.url}" class="read-more">Read More</a>
                </div>
            `;
            container.appendChild(blogElement);
        });
    }
    
    function showError() {
        const container = document.getElementById('blogs-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Unable to load blog posts at this time. Please try again later.</p>
                </div>
            `;
        }
    }
    
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});