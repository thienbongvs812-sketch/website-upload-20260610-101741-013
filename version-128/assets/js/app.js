(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function fillFilters(scope) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    if (yearSelect) {
      var years = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year');
      }).filter(Boolean))).sort().reverse();
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }
    if (typeSelect) {
      var types = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-type');
      }).filter(Boolean))).sort();
      types.forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }
  }

  function setupFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    fillFilters(scope);
    var input = scope.querySelector('[data-card-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
      });
    }
    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener(eventName, apply);
      }
    });
    apply();
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function restart() {
      window.clearInterval(timer);
      start();
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;
      function attach() {
        if (attached || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      function play() {
        attach();
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }
      attach();
      if (button) {
        button.addEventListener('click', function () {
          play();
        });
      }
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime < 0.4) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
