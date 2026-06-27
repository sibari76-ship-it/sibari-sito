document.addEventListener('DOMContentLoaded', function () {

    // =========================================
    // Menu button reference
    // =========================================
    var menuBtn = document.querySelector('.menu-btn');

    // =========================================
    // Overlay nav open / close
    // =========================================
    var overlay = document.getElementById('overlay');
    var overlayNameChars = [];

    function prepareOverlayNameAnimation() {
        overlayNameChars.forEach(function (char, index) {
            var randomDelay = (Math.random() * 0.48) + ((index % 7) * 0.035);
            var randomOffset = 30 + Math.round(Math.random() * 54);
            var randomDuration = 1.18 + (Math.random() * 0.62);

            char.style.setProperty('--overlay-char-delay', randomDelay.toFixed(3) + 's');
            char.style.setProperty('--overlay-char-offset', randomOffset + 'px');
            char.style.setProperty('--overlay-char-duration', randomDuration.toFixed(3) + 's');
        });
    }

    function openOverlay() {
        if (!overlay) return;
        prepareOverlayNameAnimation();
        overlay.classList.add('overlay--open');
        overlay.setAttribute('aria-hidden', 'false');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('overlay-open');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        if (!overlay) return;
        overlay.classList.remove('overlay--open');
        overlay.setAttribute('aria-hidden', 'true');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('overlay-open');
        document.body.style.overflow = '';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', openOverlay);
    }

    if (overlay) {
        var overlayNames = overlay.querySelectorAll('.overlay__name');
        var closeBtn = overlay.querySelector('.overlay__close');
        var serviceItems = overlay.querySelectorAll('.overlay__item--services');
        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

        overlayNames.forEach(function (name, itemIndex) {
            var label = name.textContent || '';
            var chars = [];

            for (var i = 0; i < label.length; i += 1) {
                var char = label.charAt(i);
                var safeChar = char === ' ' ? '&nbsp;' : char;
                chars.push('<span class="overlay__name-char" data-overlay-char-index="' + itemIndex + '-' + i + '">' + safeChar + '</span>');
            }

            name.innerHTML = chars.join('');
        });

        overlayNameChars = overlay.querySelectorAll('.overlay__name-char');
        prepareOverlayNameAnimation();

        serviceItems.forEach(function (item) {
            var toggle = item.querySelector('.overlay__services-toggle');
            if (!toggle) return;
            item.classList.remove('overlay__item--services-open');
            toggle.setAttribute('aria-expanded', 'false');

            toggle.addEventListener('click', function () {
                var isOpen = item.classList.contains('overlay__item--services-open');

                serviceItems.forEach(function (otherItem) {
                    var otherToggle = otherItem.querySelector('.overlay__services-toggle');
                    otherItem.classList.remove('overlay__item--services-open');
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                });

                if (!isOpen) {
                    item.classList.add('overlay__item--services-open');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });

        overlay.addEventListener('click', function (e) {
            if (e.target.matches('.overlay a') || e.target.closest('.overlay a')) {
                closeOverlay();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('overlay--open')) {
            closeOverlay();
        }
    });

    // =========================================
    // Hero slideshow — Ken Burns effect
    // =========================================
    var heroSlides = document.querySelectorAll('.hero-slide');
    var kbAnims = ['kenBurns1', 'kenBurns2', 'kenBurns3'];
    var currentHeroSlide = 0;
    var heroSlideDuration = 7000;

    if (heroSlides.length > 1) {
        function startKenBurns(slide, animIndex) {
            var img = slide.querySelector('img');
            if (!img) return;
            img.style.animation = 'none';
            img.offsetHeight; // force reflow
            img.style.animation = kbAnims[animIndex % kbAnims.length] + ' 8s ease-in-out forwards';
        }

        startKenBurns(heroSlides[0], 0);

        setInterval(function () {
            heroSlides[currentHeroSlide].classList.remove('hero-slide--active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            var nextSlide = heroSlides[currentHeroSlide];
            startKenBurns(nextSlide, currentHeroSlide);
            nextSlide.classList.add('hero-slide--active');
        }, heroSlideDuration);
    }

    // =========================================
    // Navbar scroll — add border on scroll
    // =========================================
    var header = document.querySelector('.header');

    if (header) {
        var navTicking = false;
        window.addEventListener('scroll', function () {
            if (!navTicking) {
                requestAnimationFrame(function () {
                    if (window.scrollY > 50) {
                        header.classList.add('header--scrolled');
                    } else {
                        header.classList.remove('header--scrolled');
                    }
                    navTicking = false;
                });
                navTicking = true;
            }
        }, { passive: true });
    }

    // =========================================
    // Hero parallax — RAF throttled, desktop only
    // =========================================
    var hero = document.querySelector('.hero');
    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (hero && !isMobile) {
        var heroTicking = false;
        window.addEventListener('scroll', function () {
            if (!heroTicking) {
                requestAnimationFrame(function () {
                    var offset = Math.min(window.scrollY * 0.12, 48);
                    hero.style.setProperty('--parallax-y', offset + 'px');
                    heroTicking = false;
                });
                heroTicking = true;
            }
        }, { passive: true });
    }

    // =========================================
    // Intersection Observer — reveal elements
    // =========================================
    var revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // =========================================
    // Gallery — animated entrance per photo
    // =========================================
    var galItems = document.querySelectorAll('.gal__item');
    var animTypes = ['fade', 'right', 'left', 'scale', 'up', 'blur'];

    if (galItems.length > 0) {
        galItems.forEach(function (item, i) {
            item.setAttribute('data-anim', animTypes[i % animTypes.length]);
            item.style.transitionDelay = (i * 0.08) + 's';
        });

        var galObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('gal__item--visible');
                    galObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        galItems.forEach(function (el) {
            galObserver.observe(el);
        });
    }

    // =========================================
    // Logo Grid — staggered entrance
    // =========================================
    var logoItems = document.querySelectorAll('.logo-grid__item');

    if (logoItems.length > 0) {
        var logoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('logo-grid__item--visible');
                    logoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        logoItems.forEach(function (el) {
            logoObserver.observe(el);
        });
    }

    // =========================================
    // Project cards — subtle tilt on desktop
    // =========================================
    var projectCards = document.querySelectorAll('.project-card');

    if (projectCards.length > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        projectCards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width) - 0.5;
                var y = ((e.clientY - rect.top) / rect.height) - 0.5;
                card.style.setProperty('--card-rotate-x', (-y * 4) + 'deg');
                card.style.setProperty('--card-rotate-y', (x * 6) + 'deg');
            });

            card.addEventListener('mouseleave', function () {
                card.style.setProperty('--card-rotate-x', '0deg');
                card.style.setProperty('--card-rotate-y', '0deg');
            });
        });
    }

    // =========================================
    // Intersection Observer — section lines
    // =========================================
    var sectionLines = document.querySelectorAll('.section-line');

    if (sectionLines.length > 0) {
        var lineObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-line--animate');
                    lineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        sectionLines.forEach(function (el) {
            lineObserver.observe(el);
        });
    }

    // =========================================
    // Intersection Observer — word-by-word titles
    // =========================================
    var animatedTitles = document.querySelectorAll('[data-animate-words]');

    animatedTitles.forEach(function (title) {
        // Build word spans from existing HTML (preserving .accent spans)
        var html = title.innerHTML;
        // Split on spaces but keep HTML tags intact
        var fragment = document.createElement('div');
        fragment.innerHTML = html;

        var words = [];
        fragment.childNodes.forEach(function (node) {
            if (node.nodeType === 3) {
                // Text node — split into words
                var parts = node.textContent.split(/(\s+)/);
                parts.forEach(function (part) {
                    if (part.trim()) {
                        words.push('<span class="word">' + part + '</span>');
                    } else if (part) {
                        words.push(part);
                    }
                });
            } else if (node.nodeType === 1) {
                // Element node (like <strong class="accent">) — wrap whole element as a word
                var outerHTML = node.outerHTML;
                // If it's a br, keep it as-is
                if (node.tagName === 'BR') {
                    words.push('<br>');
                } else {
                    // Split the text inside the element into words too
                    var innerWords = node.textContent.split(/(\s+)/);
                    innerWords.forEach(function (part) {
                        if (part.trim()) {
                            var clone = node.cloneNode(false);
                            clone.textContent = part;
                            words.push('<span class="word">' + clone.outerHTML + '</span>');
                        } else if (part) {
                            words.push(part);
                        }
                    });
                }
            }
        });

        title.innerHTML = words.join(' ');

        var wordSpans = title.querySelectorAll('.word');

        var titleObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    wordSpans.forEach(function (word, i) {
                        word.style.transitionDelay = (i * 0.25) + 's';
                        word.classList.add('word--visible');
                    });
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        titleObserver.observe(title);
    });

    // =========================================
    // Lightbox with gallery navigation
    // =========================================
    var lightbox = document.getElementById('lightbox');

    if (lightbox) {
        var lightboxImg = lightbox.querySelector('.lightbox__img');
        var lightboxClose = lightbox.querySelector('.lightbox__close');
        var lightboxImages = [];
        var lightboxIndex = 0;

        function showLightboxImage() {
            var img = lightboxImages[lightboxIndex];
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }

        document.addEventListener('click', function (e) {
            var img = e.target.closest('img[data-lightbox]');
            if (img) {
                lightboxImages = Array.from(document.querySelectorAll('img[data-lightbox]'));
                lightboxIndex = lightboxImages.indexOf(img);
                showLightboxImage();
                lightbox.classList.add('lightbox--open');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        });

        function closeLightbox() {
            lightbox.classList.remove('lightbox--open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lightboxImages = [];
        }


        lightboxClose.addEventListener('click', function (e) {
            e.stopPropagation();
            closeLightbox();
        });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('lightbox--open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && lightboxIndex > 0) { lightboxIndex--; showLightboxImage(); }
            if (e.key === 'ArrowRight' && lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; showLightboxImage(); }
        });
    }

    // Parallax second handler removed — consolidated above

    // =========================================
    // Cookie Banner
    // =========================================
    var cookieBanner = document.getElementById('cookieBanner');
    var cookieBall = document.getElementById('cookieBall');
    var cookieAcceptAll = document.getElementById('cookieAcceptAll');
    var cookieTechnical = document.getElementById('cookieTechnical');

    if (cookieBanner && cookieBall) {
        var cookieConsent = localStorage.getItem('cookie_consent');

        if (!cookieConsent) {
            setTimeout(function () {
                cookieBanner.classList.add('cookie-banner--visible');
            }, 800);
        } else {
            cookieBall.classList.add('cookie-ball--visible');
        }

        function hideCookieBanner() {
            cookieBanner.classList.remove('cookie-banner--visible');
            setTimeout(function () {
                cookieBall.classList.add('cookie-ball--visible');
            }, 400);
        }

        if (cookieAcceptAll) {
            cookieAcceptAll.addEventListener('click', function () {
                localStorage.setItem('cookie_consent', 'all');
                hideCookieBanner();
                // Load blocked third-party content when explicitly accepted.
                var mapIframe = document.getElementById('mapIframe');
                var mapPlaceholder = document.getElementById('mapPlaceholder');
                if (mapIframe && mapIframe.dataset.src) {
                    mapIframe.src = mapIframe.dataset.src;
                    mapIframe.style.display = '';
                }
                if (mapPlaceholder) mapPlaceholder.style.display = 'none';
            });
        }

        if (cookieTechnical) {
            cookieTechnical.addEventListener('click', function () {
                localStorage.setItem('cookie_consent', 'technical');
                hideCookieBanner();
            });
        }

        cookieBall.addEventListener('click', function () {
            cookieBall.classList.remove('cookie-ball--visible');
            cookieBanner.classList.add('cookie-banner--visible');
        });
    }

    // =========================================
    // PDF Modal (work.html)
    // =========================================
    var pdfModal = document.getElementById('pdfModal');

    if (pdfModal) {
        var pdfIframe = document.getElementById('pdfIframe');
        var pdfClose = pdfModal.querySelector('.pdf-modal__close');

        function openPdfModal(pdfUrl) {
            pdfIframe.src = pdfUrl;
            pdfModal.classList.add('pdf-modal--open');
            pdfModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closePdfModal() {
            pdfModal.classList.remove('pdf-modal--open');
            pdfModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(function () { pdfIframe.src = ''; }, 400);
        }

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.project-card__pdf-btn');
            if (btn) {
                var pdfUrl = btn.getAttribute('data-pdf');
                if (pdfUrl) openPdfModal(pdfUrl);
            }
        });

        pdfClose.addEventListener('click', closePdfModal);

        pdfModal.addEventListener('click', function (e) {
            if (e.target === pdfModal) closePdfModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && pdfModal.classList.contains('pdf-modal--open')) {
                closePdfModal();
            }
        });
    }

    /* ========================================
       Contact Form
       ======================================== */
    var contactForm = document.getElementById('contactForm');
    var contactFormCard = document.getElementById('contactFormCard');
    var contactFormSuccess = document.getElementById('contactFormSuccess');
    var submitBtn = document.getElementById('contactSubmitBtn');
    var contactSectionLine = document.getElementById('contactSectionLine');
    var contactSectionTitle = document.getElementById('contactSectionTitle');
    var contactSectionSubtitle = document.getElementById('contactSectionSubtitle');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            submitBtn.disabled = true;
            submitBtn.textContent = 'Invio in corso...';
            var formData = new FormData(contactForm);
            var payload = {
                name: (formData.get('name') || '').toString(),
                email: (formData.get('email') || '').toString(),
                phone: (formData.get('phone') || '').toString(),
                service: (formData.get('service') || '').toString(),
                message: (formData.get('message') || '').toString()
            };

            fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(function (response) {
                if (response.ok) {
                    if (document.activeElement && typeof document.activeElement.blur === 'function') {
                        document.activeElement.blur();
                    }

                    contactForm.reset();
                    if (contactSectionLine) contactSectionLine.style.display = 'none';
                    if (contactSectionTitle) contactSectionTitle.style.display = 'none';
                    if (contactSectionSubtitle) contactSectionSubtitle.style.display = 'none';
                    contactFormCard.classList.add('contact-form-card--success');
                    contactFormCard.innerHTML = contactFormSuccess.innerHTML;

                    requestAnimationFrame(function () {
                        contactFormCard.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    });
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Invia messaggio';
                    alert('Errore nell\'invio. Riprova o scrivi a info@sibaribonato.com');
                }
            })
            .catch(function () {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Invia messaggio';
                alert('Errore di connessione. Riprova o scrivi a info@sibaribonato.com');
            });
        });
    }

});
