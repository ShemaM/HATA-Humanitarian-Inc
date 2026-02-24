document.addEventListener('DOMContentLoaded', () => {
    const routeLabel = (url) => {
        const pathname = url.pathname.replace(/\/+$/, '') || '/';
        const labels = {
            '/': 'Home',
            '/donate': 'Donate',
            '/contact': 'Contact',
            '/partners': 'Partners',
            '/podcasts': 'Podcasts',
            '/programs/mental-health': 'Mental Health Support',
            '/programs/addiction-recovery': 'Addiction Recovery',
            '/programs/newcomer': 'Newcomer Support',
        };

        if (labels[pathname]) return labels[pathname];

        const parts = pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || 'Page';
        return decodeURIComponent(last)
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const ensureGlobalLoader = () => {
        let loader = document.getElementById('hata-global-loader');
        if (loader) return loader;

        loader = document.createElement('div');
        loader.id = 'hata-global-loader';
        loader.className = 'hata-loader';
        loader.hidden = true;
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');
        loader.setAttribute('aria-label', 'Page is loading');

        loader.innerHTML = `
            <div class="hata-loader__panel">
                <div class="hata-loader__row">
                    <div class="hata-loader__mark" aria-hidden="true">
                        <div class="hata-loader__spinner"></div>
                    </div>
                    <div>
                        <div class="hata-loader__title">Redirecting</div>
                        <div class="hata-loader__message" data-hata-loader-message>Taking you to the next page…</div>
                        <div class="hata-loader__hint">Please wait a moment while we load the content.</div>
                    </div>
                </div>
            </div>
        `.trim();

        document.body.appendChild(loader);
        return loader;
    };

    const showGlobalLoader = (destinationUrl, linkEl) => {
        const loader = ensureGlobalLoader();
        const messageEl = loader.querySelector('[data-hata-loader-message]');
        const label = routeLabel(destinationUrl);
        const custom = linkEl && linkEl.getAttribute('data-loader-message');

        if (messageEl) {
            messageEl.textContent = custom || `Redirecting to ${label}…`;
        }

        loader.hidden = false;
        document.body.setAttribute('aria-busy', 'true');
    };

    const hideGlobalLoader = () => {
        const loader = document.getElementById('hata-global-loader');
        if (loader) loader.hidden = true;
        document.body.removeAttribute('aria-busy');
    };

    // If the page is restored from BFCache, ensure loader is hidden.
    window.addEventListener('pageshow', hideGlobalLoader);
    hideGlobalLoader();

    // Show loader when navigating between pages (internal links).
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!anchor) return;
        if (anchor.hasAttribute('download')) return;
        if (anchor.getAttribute('target') === '_blank') return;
        if (anchor.getAttribute('rel') && anchor.getAttribute('rel').includes('external')) return;
        if (anchor.dataset && anchor.dataset.noLoader != null) return;

        const rawHref = anchor.getAttribute('href') || '';
        if (!rawHref || rawHref === '#') return;
        if (rawHref.startsWith('#')) return; // in-page navigation
        if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

        let destinationUrl;
        try {
            destinationUrl = new URL(rawHref, window.location.href);
        } catch {
            return;
        }

        if (destinationUrl.origin !== window.location.origin) return;

        const samePath = destinationUrl.pathname === window.location.pathname;
        const sameSearch = destinationUrl.search === window.location.search;
        const sameHash = destinationUrl.hash === window.location.hash;
        if (samePath && sameSearch && sameHash) return;

        // If only the hash changes on the same page, don't show the loader.
        if (samePath && sameSearch && destinationUrl.hash && destinationUrl.hash !== window.location.hash) return;

        showGlobalLoader(destinationUrl, anchor);
    }, true);

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute(
                'aria-expanded',
                mobileMenu.classList.contains('hidden') ? 'false' : 'true'
            );
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenuButton.focus();
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Animation on scroll with Intersection Observer
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-slide-up');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
            observer.observe(element);
        });
    };

    animateOnScroll();

    // Team member bio toggle
    const teamMemberButtons = document.querySelectorAll('.team-member-button');
    teamMemberButtons.forEach(button => {
        const bio = button.nextElementSibling;
        if (bio && !bio.id) {
            bio.id = `team-bio-${Math.random().toString(16).slice(2)}`;
        }
        if (bio && bio.id) {
            button.setAttribute('aria-controls', bio.id);
        }
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => {
            const nextBio = button.nextElementSibling;
            if (!nextBio) return;
            nextBio.classList.toggle('hidden');
            const expanded = !nextBio.classList.contains('hidden');
            button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            if (!expanded) {
                button.textContent = 'Read Bio';
            } else {
                button.textContent = 'Close Bio';
            }
        });
    });

    const initCarousel = (carouselEl) => {
        if (!carouselEl || carouselEl._hataCarousel) return;

        const viewport = carouselEl.querySelector('[data-carousel-viewport]');
        if (!viewport) return;

        const prevBtn = carouselEl.querySelector('[data-carousel-prev]');
        const nextBtn = carouselEl.querySelector('[data-carousel-next]');
        const dotsRoot = carouselEl.querySelector('[data-carousel-dots]');

        const getSlides = () => Array.from(viewport.querySelectorAll(':scope > [data-carousel-slide]'));

        let slideOffsets = [];
        let activeIndex = 0;
        let rafId = null;

        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

        const findNearestIndex = () => {
            if (!slideOffsets.length) return 0;
            const target = viewport.scrollLeft + (viewport.clientWidth / 2);
            let bestIndex = 0;
            let bestDist = Infinity;
            for (let i = 0; i < slideOffsets.length; i++) {
                const dist = Math.abs(slideOffsets[i] - target);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIndex = i;
                }
            }
            return bestIndex;
        };

        const scrollToIndex = (index, { behavior = 'smooth' } = {}) => {
            const slides = getSlides();
            const max = Math.max(0, slides.length - 1);
            const next = clamp(index, 0, max);
            const left = slideOffsets[next] ?? 0;
            viewport.scrollTo({ left, behavior });
        };

        const renderDots = () => {
            if (!dotsRoot) return;
            const slides = getSlides();
            dotsRoot.innerHTML = '';
            slides.forEach((_, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-300 transition';
                btn.setAttribute('aria-label', `Go to slide ${idx + 1}`);
                btn.addEventListener('click', () => scrollToIndex(idx));
                dotsRoot.appendChild(btn);
            });
        };

        const updateUi = () => {
            activeIndex = findNearestIndex();

            if (prevBtn) prevBtn.disabled = activeIndex <= 0;
            if (nextBtn) nextBtn.disabled = activeIndex >= slideOffsets.length - 1;

            if (dotsRoot) {
                const dots = Array.from(dotsRoot.querySelectorAll('button'));
                dots.forEach((dot, idx) => {
                    if (idx === activeIndex) {
                        dot.classList.add('bg-hata-red');
                        dot.classList.remove('bg-gray-200');
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.classList.remove('bg-hata-red');
                        dot.classList.add('bg-gray-200');
                        dot.removeAttribute('aria-current');
                    }
                });
            }
        };

        const compute = () => {
            const slides = getSlides();
            slideOffsets = slides.map((s) => s.offsetLeft);
            renderDots();
            updateUi();
        };

        const onScroll = () => {
            if (rafId != null) return;
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                updateUi();
            });
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => scrollToIndex(activeIndex - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => scrollToIndex(activeIndex + 1));
        }

        viewport.addEventListener('scroll', onScroll, { passive: true });
        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollToIndex(activeIndex - 1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollToIndex(activeIndex + 1);
            }
        });

        window.addEventListener('resize', compute);

        carouselEl._hataCarousel = { compute, scrollToIndex };
        compute();
    };

    const initCarousels = () => {
        document.querySelectorAll('[data-hata-carousel]').forEach(initCarousel);
    };

    window.HATA = window.HATA || {};
    window.HATA.refreshCarousel = (carouselEl) => {
        if (!carouselEl) return;
        if (carouselEl._hataCarousel && typeof carouselEl._hataCarousel.compute === 'function') {
            carouselEl._hataCarousel.compute();
            return;
        }
        initCarousel(carouselEl);
    };

    initCarousels();
});
