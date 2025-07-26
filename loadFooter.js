document.addEventListener('DOMContentLoaded', function() {
  // Remove any existing footers first
  const existingFooters = document.querySelectorAll('footer');
  existingFooters.forEach(footer => {
    if (!footer.id || footer.id !== 'hata-footer') {
      footer.remove();
    }
  });

  // Load new footer
  fetch('footer.html')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newFooter = doc.querySelector('#hata-footer');
      
      if (newFooter) {
        document.body.appendChild(newFooter);
        
        // Load Bootstrap if not already loaded
        if (!document.querySelector('[href*="bootstrap"]')) {
          const bootstrapCSS = document.createElement('link');
          bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
          bootstrapCSS.rel = 'stylesheet';
          
          const bootstrapJS = document.createElement('script');
          bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
          
          document.head.appendChild(bootstrapCSS);
          document.body.appendChild(bootstrapJS);
        }
        
        // Load Font Awesome if not already loaded
        if (!document.querySelector('[href*="font-awesome"]')) {
          const faLink = document.createElement('link');
          faLink.rel = 'stylesheet';
          faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
          document.head.appendChild(faLink);
        }
      }
    })
    .catch(error => {
      console.error('Error loading footer:', error);
      // Basic fallback footer
      const fallbackFooter = document.createElement('footer');
      fallbackFooter.id = 'hata-footer';
      fallbackFooter.className = 'bg-dark text-white p-3 text-center';
      fallbackFooter.innerHTML = `
        <p class="mb-0">HATA Humanitarian &copy; 2025 | 
          <a href="tel:+14319988892" class="text-white">(431) 998 8892</a>
        </p>
      `;
      document.body.appendChild(fallbackFooter);
    });
});