
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('.js-filter-input');
  var typeFilter = document.querySelector('.js-type-filter');
  var sortButton = document.querySelector('.js-sort-year');
  var filterScope = document.querySelector('[data-filter-scope]');
  var descending = true;

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!filterScope) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var typeValue = normalize(typeFilter ? typeFilter.value : '');
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-movie-card]'));

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var cardType = normalize(card.getAttribute('data-type'));
      var keywordMatched = !keyword || searchText.indexOf(keyword) !== -1;
      var typeMatched = !typeValue || cardType.indexOf(typeValue) !== -1;
      card.classList.toggle('is-hidden', !(keywordMatched && typeMatched));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilter);
  }

  if (sortButton && filterScope) {
    sortButton.addEventListener('click', function () {
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-movie-card]'));

      cards.sort(function (a, b) {
        var yearA = Number(a.getAttribute('data-year')) || 0;
        var yearB = Number(b.getAttribute('data-year')) || 0;
        return descending ? yearA - yearB : yearB - yearA;
      });

      descending = !descending;
      cards.forEach(function (card) {
        filterScope.appendChild(card);
      });
      applyFilter();
    });
  }
})();
