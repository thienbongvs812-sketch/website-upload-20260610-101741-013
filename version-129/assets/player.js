import { H as Hls } from "./hls-dru42stk.js";

function initializePlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-start-button");
    var message = player.querySelector(".player-message");

    if (!video || !button) {
        return;
    }

    var source = video.getAttribute("data-src");
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text || "";
        }
    }

    function loadSource() {
        if (!source) {
            setMessage("当前影片没有可用播放源。");
            return Promise.reject(new Error("Missing video source"));
        }

        if (initialized) {
            return Promise.resolve();
        }

        initialized = true;
        setMessage("正在初始化播放源...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setMessage("播放源已就绪。");
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setMessage("播放源已就绪。");
            });

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage("播放源加载失败，请稍后重试。");
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                    initialized = false;
                }
            });
            return Promise.resolve();
        }

        setMessage("当前浏览器不支持 HLS 播放。");
        return Promise.reject(new Error("HLS is not supported"));
    }

    button.addEventListener("click", function () {
        loadSource()
            .then(function () {
                player.classList.add("playing");
                return video.play();
            })
            .catch(function () {
                player.classList.remove("playing");
            });
    });

    video.addEventListener("play", function () {
        player.classList.add("playing");
    });

    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            player.classList.remove("playing");
        }
    });
}

document.querySelectorAll("[data-player]").forEach(initializePlayer);
