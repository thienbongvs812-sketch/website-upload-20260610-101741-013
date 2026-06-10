(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5600);
  }

  var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  filterBlocks.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || card.textContent || '';
        var ok = true;
        if (q && text.toLowerCase().indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    };
    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
    if (type) type.addEventListener('change', apply);
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var cover = document.getElementById('playCover');
  if (!video || !streamUrl) return;
  var hlsInstance = null;
  var loadVideo = function () {
    if (video.getAttribute('data-ready') !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('data-ready', '1');
    }
    if (cover) cover.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  };
  if (cover) {
    cover.addEventListener('click', loadVideo);
  }
  video.addEventListener('click', function () {
    if (video.getAttribute('data-ready') !== '1') {
      loadVideo();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}
