(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  ready(function() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function() {
          showSlide(current + 1);
        }, 5200);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        schedule();
      });
    }

    schedule();

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var searchInput = document.getElementById("search-page-input");
    if (searchInput && q) {
      searchInput.value = q;
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".card-filter-input"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function filterCards(value) {
      var keyword = normalize(value);
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        card.classList.toggle("is-filter-hidden", Boolean(keyword) && haystack.indexOf(keyword) === -1);
        var holder = card.closest(".ranking-item");
        if (holder) {
          holder.classList.toggle("is-filter-hidden", card.classList.contains("is-filter-hidden"));
        }
      });
    }

    filterInputs.forEach(function(input) {
      input.addEventListener("input", function() {
        filterCards(input.value);
      });
    });

    if (q) {
      filterCards(q);
    }

    var sortSelects = Array.prototype.slice.call(document.querySelectorAll(".card-sort-select"));
    sortSelects.forEach(function(select) {
      select.addEventListener("change", function() {
        var list = document.querySelector("[data-card-list]");
        if (!list) {
          return;
        }
        var items = Array.prototype.slice.call(list.children);
        var mode = select.value;
        items.sort(function(a, b) {
          var ac = a.classList.contains("movie-card") ? a : a.querySelector(".movie-card");
          var bc = b.classList.contains("movie-card") ? b : b.querySelector(".movie-card");
          var ay = Number(ac && ac.getAttribute("data-year")) || 0;
          var by = Number(bc && bc.getAttribute("data-year")) || 0;
          var at = ac ? ac.getAttribute("data-title") || "" : "";
          var bt = bc ? bc.getAttribute("data-title") || "" : "";
          if (mode === "year-desc") {
            return by - ay;
          }
          if (mode === "year-asc") {
            return ay - by;
          }
          if (mode === "title-asc") {
            return at.localeCompare(bt, "zh-CN");
          }
          return 0;
        });
        items.forEach(function(item) {
          list.appendChild(item);
        });
      });
    });
  });
}());
