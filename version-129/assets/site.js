(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobilePanel = document.querySelector(".mobile-nav-panel");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var isOpen = mobilePanel.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var searchPage = document.querySelector("[data-search-page]");
        if (searchPage) {
            var input = searchPage.querySelector(".local-search-input");
            var selects = Array.prototype.slice.call(searchPage.querySelectorAll(".filter-select"));
            var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
            var resultCount = searchPage.querySelector("#searchResultCount");
            var urlQuery = new URLSearchParams(window.location.search).get("q") || "";

            if (input && urlQuery) {
                input.value = urlQuery;
            }

            function applyFilters() {
                var keyword = normalize(input ? input.value : "");
                var activeFilters = {};

                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter");
                    activeFilters[key] = normalize(select.value);
                });

                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedFilters = true;

                    Object.keys(activeFilters).forEach(function (key) {
                        var expected = activeFilters[key];
                        var actual = normalize(card.getAttribute("data-" + key));
                        if (expected && actual !== expected) {
                            matchedFilters = false;
                        }
                    });

                    var shouldShow = matchedKeyword && matchedFilters;
                    card.classList.toggle("hidden-by-filter", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = visible + " 部";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            applyFilters();
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-slide")) || 0);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }
    });
})();
