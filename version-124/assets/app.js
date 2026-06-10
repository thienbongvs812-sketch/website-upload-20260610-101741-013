(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                document.body.classList.remove('menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function filterCards(scope) {
        var input = scope.querySelector('[data-search-input]');
        var active = scope.querySelector('[data-filter-button].is-active');
        var query = input ? normalize(input.value) : '';
        var filter = active ? active.getAttribute('data-filter-value') : 'all';
        scope.querySelectorAll('[data-movie-card]').forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchFilter = filter === 'all' || haystack.indexOf(normalize(filter)) !== -1;
            card.hidden = !(matchQuery && matchFilter);
        });
    }

    function initSearch() {
        document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            if (input) {
                input.addEventListener('input', function () {
                    filterCards(scope);
                });
            }
            scope.querySelectorAll('[data-filter-button]').forEach(function (button) {
                button.addEventListener('click', function () {
                    scope.querySelectorAll('[data-filter-button]').forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                    filterCards(scope);
                });
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5800);
    }

    function attachVideo(video, url) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video.__hls) {
                video.__hls.destroy();
            }
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.__hls = hls;
            return;
        }
        video.src = url;
    }

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-player-overlay]');
        if (!video) {
            return;
        }
        var url = video.getAttribute('data-src');
        if (!url) {
            return;
        }
        if (!video.getAttribute('src') && !video.__hls) {
            attachVideo(video, url);
        }
        video.controls = true;
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    function initPlayers() {
        document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
            var overlay = shell.querySelector('[data-player-overlay]');
            var button = shell.querySelector('[data-player-button]');
            var video = shell.querySelector('video');
            if (overlay) {
                overlay.addEventListener('click', function () {
                    startPlayer(shell);
                });
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    startPlayer(shell);
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!video.getAttribute('src') && !video.__hls) {
                        startPlayer(shell);
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initSearch();
        initHero();
        initPlayers();
    });
}());
