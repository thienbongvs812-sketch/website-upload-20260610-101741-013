(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-hero-tab]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        show(Number(tab.getAttribute("data-hero-tab")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function filterCards() {
    var input = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-select-filter]"));

    function apply() {
      var term = normalize(input.value);
      var selectRules = selects.map(function (select) {
        return {
          key: select.getAttribute("data-select-filter"),
          value: normalize(select.value)
        };
      });
      cards.forEach(function (card) {
        var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-type"));
        var matchedText = !term || text.indexOf(term) !== -1;
        var matchedSelects = selectRules.every(function (rule) {
          if (!rule.value) {
            return true;
          }
          return normalize(card.getAttribute(rule.key)) === rule.value;
        });
        card.classList.toggle("is-hidden-by-filter", !(matchedText && matchedSelects));
      });
    }

    var queryFill = document.querySelector("[data-query-fill]");
    if (queryFill) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        queryFill.value = q;
      }
    }

    input.addEventListener("input", apply);
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    var clearButton = document.querySelector("[data-clear-filter]");
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        selects.forEach(function (select) {
          select.value = "";
        });
        apply();
      });
    }

    apply();
  }

  function setupPlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video || !source) {
      return;
    }
    var ready = false;
    var hls = null;

    function load() {
      if (!ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        ready = true;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", load);
    }
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        load();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    setupPlayer: setupPlayer
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    filterCards();
  });
})();
