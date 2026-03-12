document.addEventListener('DOMContentLoaded', function () {

    // =========================================
    // Mobile nav toggle
    // =========================================
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('nav--open');
            document.body.style.overflow = expanded ? '' : 'hidden';
        });

        nav.addEventListener('click', function (e) {
            if (e.target.matches('.nav__link')) {
                toggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('nav--open');
                document.body.style.overflow = '';
            }
        });
    }

    // =========================================
    // Navbar scroll — add border on scroll
    // =========================================
    var header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
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
            item.style.transitionDelay = (i * 0.15) + 's';
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
        var lightboxPrev = lightbox.querySelector('.lightbox__prev');
        var lightboxNext = lightbox.querySelector('.lightbox__next');
        var lightboxImages = [];
        var lightboxIndex = 0;

        function showLightboxImage() {
            var img = lightboxImages[lightboxIndex];
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            if (lightboxPrev) lightboxPrev.style.display = lightboxIndex > 0 ? '' : 'none';
            if (lightboxNext) lightboxNext.style.display = lightboxIndex < lightboxImages.length - 1 ? '' : 'none';
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

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function (e) {
                e.stopPropagation();
                if (lightboxIndex > 0) { lightboxIndex--; showLightboxImage(); }
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', function (e) {
                e.stopPropagation();
                if (lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; showLightboxImage(); }
            });
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

    // =========================================
    // Parallax hero — 0.3 ratio
    // =========================================
    var heroBg = document.querySelector('.hero');

    if (heroBg && window.matchMedia('(hover: hover)').matches) {
        window.addEventListener('scroll', function () {
            var scrollY = window.pageYOffset;
            var offset = scrollY * 0.3;
            heroBg.style.setProperty('--parallax-y', offset + 'px');
        }, { passive: true });
    }

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

    /* ========================================
       Contact Form (Formspree)
       ======================================== */
    var contactForm = document.getElementById('contactForm');
    var contactFormCard = document.getElementById('contactFormCard');
    var contactFormSuccess = document.getElementById('contactFormSuccess');
    var replyToField = document.getElementById('replyToField');
    var emailField = document.getElementById('email');
    var submitBtn = document.getElementById('contactSubmitBtn');

    if (contactForm) {
        // Sync _replyto with email field
        emailField.addEventListener('input', function () {
            replyToField.value = emailField.value;
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Sync one last time before submit
            replyToField.value = emailField.value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Invio in corso...';

            var formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(function (response) {
                if (response.ok) {
                    contactFormCard.style.display = 'none';
                    contactFormSuccess.classList.add('contact-form-success--visible');
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
