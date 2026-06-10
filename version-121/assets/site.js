import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const nav = $('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
    });
}

function setupHero() {
    const hero = $('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);

    if (slides.length <= 1) {
        return;
    }

    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    const start = () => {
        timer = window.setInterval(() => show(current + 1), 5000);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            stop();
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function setupImageFallback() {
    $$('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.classList.add('is-missing');
        });
    });
}

function setupFilters() {
    const panel = $('[data-filter-panel]');
    const grid = $('[data-card-grid]');

    if (!panel || !grid) {
        return;
    }

    const cards = $$('.movie-card', grid);
    const searchInput = $('[data-search-input]', panel);
    const filters = $$('[data-filter]', panel);
    const resultCount = $('[data-result-count]', panel);
    const reset = $('[data-reset-filter]', panel);
    const noResults = $('[data-no-results]');

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const apply = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        const activeFilters = Object.fromEntries(filters.map((filter) => [filter.dataset.filter, filter.value]));
        let visible = 0;

        cards.forEach((card) => {
            const text = normalize(card.dataset.search);
            const matchesQuery = !query || text.includes(query);
            const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
                if (!value) {
                    return true;
                }

                return (card.dataset[key] || '') === value;
            });
            const shouldShow = matchesQuery && matchesFilters;

            card.classList.toggle('is-hidden', !shouldShow);

            if (shouldShow) {
                visible += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = `共 ${visible} 部影片`;
        }

        if (noResults) {
            noResults.classList.toggle('is-visible', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', apply);
    }

    filters.forEach((filter) => {
        filter.addEventListener('change', apply);
    });

    if (reset) {
        reset.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }

            filters.forEach((filter) => {
                filter.value = '';
            });

            apply();
        });
    }

    apply();
}

function setupQuickSearch() {
    const form = $('[data-quick-search]');

    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = $('[name="q"]', form);
        const value = input ? input.value.trim() : '';
        const target = value ? `./library.html?q=${encodeURIComponent(value)}` : './library.html';
        window.location.href = target;
    });
}

function setupPlayers() {
    $$('.player-shell').forEach((shell) => {
        const video = $('video', shell);
        const overlay = $('.player-overlay', shell);
        const startButton = $('.player-start', shell);
        const status = $('[data-player-status]');
        const source = shell.dataset.videoSrc;
        let hls = null;
        let initialized = false;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const play = async () => {
            if (!video || !source) {
                setStatus('当前影片暂未绑定播放源。');
                return;
            }

            if (!initialized) {
                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.ERROR, (_, data) => {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败，请刷新页面后重试。');
                        }
                    });
                } else {
                    video.src = source;
                }
            }

            try {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                await video.play();
                setStatus('播放源已加载，可使用播放器控件调整进度、音量与全屏。');
            } catch (error) {
                setStatus('浏览器阻止了自动播放，请再次点击播放器播放按钮。');
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            }
        };

        if (startButton) {
            startButton.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (!initialized) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

setupMobileMenu();
setupHero();
setupImageFallback();
setupQuickSearch();
setupFilters();
setupPlayers();
