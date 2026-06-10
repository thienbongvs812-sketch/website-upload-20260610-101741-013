(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startCarousel() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                startCarousel();
            });
        });

        if (slides.length > 1) {
            startCarousel();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        var input = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var noResult = document.querySelector('[data-no-result]');
        var categorySelect = document.querySelector('[data-category-select]');
        var keyword = normalize(input ? input.value : '');
        var category = categorySelect ? categorySelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardCategory = card.getAttribute('data-category') || '';
            var matchedText = !keyword || text.indexOf(keyword) !== -1;
            var matchedCategory = !category || category === cardCategory;
            var matched = matchedText && matchedCategory;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('active', visible === 0);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var categorySelect = document.querySelector('[data-category-select]');
    var searchPageForm = document.querySelector('[data-search-page-form]');

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', applyFilter);
    }

    if (searchPageForm) {
        searchPageForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
    }

    window.initMoviePlayer = function (videoSource) {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        var hlsInstance = null;
        var attached = false;

        if (!video || !videoSource) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoSource;
            }

            attached = true;
        }

        function startPlay() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                startPlay();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (!attached) {
                startPlay();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
