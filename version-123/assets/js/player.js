
(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var hlsInstance = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function playVideo() {
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

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!attached) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
