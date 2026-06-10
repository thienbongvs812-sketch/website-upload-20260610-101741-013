(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      });
    });
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
      var prev = carousel.querySelector("[data-slide-prev]");
      var next = carousel.querySelector("[data-slide-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide-dot")) || 0);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      show(0);
      restart();
    });
  }

  function prepareOptions(form, cards) {
    var regionSelect = form.querySelector("[data-region-filter]");
    var typeSelect = form.querySelector("[data-type-filter]");
    var yearSelect = form.querySelector("[data-year-filter]");

    function fill(select, values) {
      if (!select) {
        return;
      }
      values.sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-Hans-CN");
      }).forEach(function (value) {
        if (!value) {
          return;
        }
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    var regions = [];
    var types = [];
    var years = [];
    cards.forEach(function (card) {
      var region = card.getAttribute("data-region") || "";
      var type = card.getAttribute("data-type") || "";
      var year = card.getAttribute("data-year") || "";
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    fill(regionSelect, regions.slice(0, 80));
    fill(typeSelect, types.slice(0, 80));
    fill(yearSelect, years.slice(0, 80));
  }

  function initFilters() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      var scope = form.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var input = form.querySelector("[data-search-input]");
      var regionSelect = form.querySelector("[data-region-filter]");
      var typeSelect = form.querySelector("[data-type-filter]");
      var yearSelect = form.querySelector("[data-year-filter]");
      var sortSelect = form.querySelector("[data-sort-select]");
      var empty = scope.querySelector("[data-empty-state]");
      var grid = scope.querySelector("[data-card-grid]");

      prepareOptions(form, cards);

      function matches(card) {
        var query = normalize(input ? input.value : "");
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        return (!query || haystack.indexOf(query) !== -1)
          && (!region || card.getAttribute("data-region") === region)
          && (!type || card.getAttribute("data-type") === type)
          && (!year || card.getAttribute("data-year") === year);
      }

      function sortCards() {
        if (!sortSelect || !grid) {
          return;
        }
        var mode = sortSelect.value;
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (mode === "newest") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (mode === "oldest") {
            return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
          }
          if (mode === "title") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return cards.indexOf(a) - cards.indexOf(b);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var visible = 0;
        sortCards();
        cards.forEach(function (card) {
          var keep = matches(card);
          card.hidden = !keep;
          if (keep) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video[data-hls]");
      var button = shell.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-hls");
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start() {
        prepare();
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("loadedmetadata", function () {
        if (hls && video.duration && video.duration > 0) {
          video.setAttribute("data-ready", "true");
        }
      });
      prepare();
    });
  }

  ready(function () {
    initImages();
    initNavigation();
    initCarousel();
    initFilters();
    initPlayers();
  });
})();
