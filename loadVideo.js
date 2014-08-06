(function($) {
    methods = {
        init: function(options) {
            //Empty the container so that we have what we need.
            var container = $(this).empty(),
                defaults = {
                    autoPlay: false,
                    urlOrId: null, //Can pass either full url or flat ID
                    videoLocation: 'YouTube', //Can be set to Vimeo or Youtube
                    videoWidth: 500, //Can be set to 'fill'        
                    videoHeight: 450, //Can be set to 'fill'
                    customClass: 'videoContainer', // Add this to your new iframe that the plugin will create.
                    onPause: function(state, player, e) {},
                    beforeLoad: function(state, player, e) {},
                    onVideoEnd: function(state, player, e) {},
                    onReady: function(state, player, e) {},
                    onSeek: function(state, player, e) {},
                    onPlay: function(state, player, e) {},
                    onStop: function(state, player, e) {},
                    onUnload: function(state, player, e) {},
                    getMatchedVideo: function(state, player, e) {}
                },
                attrs;

            settings = $.extend({}, defaults, options);
            // Call before load before we doing anything
            settings.beforeLoad.call(container.get(0));
            // Setup our containers for youtube or vimeo depending on settings.videoLocation            
            settings['isYouTube'] = settings.videoLocation.toLowerCase() == 'youtube';
            //Setup our videoID variable
            var matchedInfo = methods.matchID.apply(container.get(0), [settings.urlOrId]);
            // Set our videoID variable
            settings['videoID'] = matchedInfo.id;
            // May override your setting depending on input of urlOrID variable.
            settings.isYouTube = (matchedInfo.type == 'youtube');

            if (settings.videoID == 'Error') {
                container.html('variable urlOrId is not correct, please check you have parsed the right information.');
            } else {
                if (settings.isYouTube) {
                    $('body').attr('data-youtube-api', 'waiting');
                    $('body').removeAttr('data-vimeo-api');
                    if ($('body[data-youtube-api-appended]').length == 0) {
                        $('head').append('<script type="text/javascript" id="youTubeAPIScript" src="http://www.youtube.com/iframe_api"></script>');
                    }
                    methods.drawIframe.call(container);
                    var youTubeTimer = setInterval(function() {
                        if ($('body').attr('data-youtube-api') == 'ready' || $('body[data-youtube-api-appended]').length > 0) {
                            clearInterval(youTubeTimer);
                            buildYouTubeContainer(container, settings);
                        }
                    }, 200);
                } else {
                    $('body').attr('data-vimeo-api', 'waiting');
                    $('body').removeAttr('data-youtube-api');
                    methods.drawIframe.call(container);
                    var vimeoTimer = setInterval(function() {
                        if ($('body').attr('data-vimeo-api') == 'ready') {
                            clearInterval(vimeoTimer);
                            performVimeoTasksAfterReady(container, settings);
                        }
                    }, 200);
                }
            }
        },
        play: function() {
            (methods.checkPlayer.apply(this)) ? ytplayer.playVideo() : methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
        },
        pause: function() {
            (methods.checkPlayer.apply(this)) ? ytplayer.pauseVideo() : methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['pause']);
        },
        stop: function() {
            var iframe = $(this);
            iframe.html(iframe.html());
            methods.stateFunctions.apply(this, ['stop', iframe, this]);
        },
        unload: function() {
            $(this).empty();
            methods.stateFunctions.apply(this, ['unload', $(this), this]);
        },
        seekTo: function(time) {
            var player = $(this);
            if (typeof(time == 'undefined')) {
                time = 0;
            }
            if (methods.checkPlayer.apply(this)) {
                ytplayer.seekTo(time);
                //Youtube api has no return from the above event, forcing attr
                return methods.stateFunctions.apply(ytplayer, ['youtubeSeek', player, this]);
            } else {
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', time]);
            }
        },
        restart: function() {
            var player = $(this);
            if (methods.checkPlayer.apply(this)) {
                ytplayer.seekTo(0);
                ytplayer.playVideo();
                //Youtube api has no return from the above event, forcing attr
                return methods.stateFunctions.apply(ytplayer, ['youtubeSeek', player, this]);
            } else {
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', 0]);
            }
        },
        drawIframe: function() {
            var apiName = (settings.isYouTube ? 'enablejsapi' : 'api');
            var urlName = (settings.isYouTube ? 'http://www.youtube.com/embed/' : 'http://player.vimeo.com/video/');
            var plyName = (settings.isYouTube ? 'YouTube' : 'Vimeo');
            $(this).html('<iframe data-player="' + plyName + '" id="' + settings.videoID + 'Container" class="' + settings.customClass + '" src="' + urlName + settings.videoID + '?' + apiName + '=1&player_id=' + settings.videoID + 'Container" width="' + settings.videoWidth + '" height="' + settings.videoHeight + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
        },
        checkPlayer: function() {
            return ($(this).find('iframe').attr('data-player') == 'YouTube');
        },
        stateFunctions: function(state, player, e) {
            switch (state) {
                case -1:
                case 'ready':
                    if (settings.isYouTube) {
                        $('body').attr('data-youtube-api', 'ready');
                    } else {
                        $('body').attr('data-vimeo-api', 'ready');
                    }
                    settings.onReady.apply(this, [state, player, e]);
                    break;
                case 0:
                case 'finish':
                    settings.onVideoEnd.apply(this, [state, player, e]);
                    break;
                case 1:
                case 'play':
                    settings.onPlay.apply(this, [state, player, e]);
                    break;
                case 'stop':
                    settings.onStop.apply(this, [state, player, e]);
                case 'unload':
                    settings.onUnload.apply(this, [state, player, e]);
                case 2:
                case 'pause':
                    settings.onPause.apply(this, [state, player, e]);
                    break;
                case 'youtubeSeek':
                case 'seek':
                    settings.onSeek.apply(this, [state, player, e]);
                case 'returnID':
                    settings.getMatchedVideo.apply(this, [state, player, e]);
                default:
                    settings.beforeLoad.apply(this, [state, player, e]);
            }
        },
        vimeoApiFunctions: function(action, value) {
            var data = {
                    method: action
                },
                url = $(this).attr('src').split('?')[0];
            if (value) {
                data.value = value;
            }
            $(this).get(0).contentWindow.postMessage(JSON.stringify(data), url);
        },
        matchID: function(url) {
            // The following regex will only determine the location of the URL.
            // A simple indexOf wasn't used as the url might contain the text of vimeo or youtube in the videoname or username.
            url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|\.com\.))?/);
            // Set the default to youtube.
            var type = 'youtube';
            // Search for vimeo in the match.
            if (RegExp.$3.indexOf('vimeo') > -1) {
                var type = 'vimeo';
            }
            // Split on slashes
            var sres = url.split("/");
            // Grap everything after the last slash.
            var dirtyid = sres[sres.length - 1];
            // Return the type, and the split id.
            return {
                type: type,
                id: dirtyid.replace("watch?v=", "").split(/&|#|\?/)[0]
            }
        }
    };

    $.fn.loadVideo = function(methodOrOptions) {
        var $this = this;

        if (methods[methodOrOptions]) {
            //Apply methods
            return methods[methodOrOptions].apply($this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to init if no method
            return methods.init.apply($this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.loadVideo');
        }
    };

})(jQuery);

// Listen for messages from the vimeo player
if (window.addEventListener) {
    window.addEventListener('message', onMessageReceived, false);
} else {
    window.attachEvent('onmessage', onMessageReceived, false);
}

// Handle messages received from the player
function onMessageReceived(e) {
    if ($('body[data-youtube-api]').length == 0) {
        var data = JSON.parse(e.data);
        var player = $('#' + data.player_id);
        methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'pause']);
        methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'finish']);
        methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'play']);
        methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'seek']);

        return methods.stateFunctions.apply(player, [data.event, player, e]);
    }
}

function buildYouTubeContainer(c, s) {
    c.html('<div id="' + s.videoID + 'Container"></div>');
    ytplayer = new YT.Player(s.videoID + 'Container', {
        videoId: s.videoID,
        height: s.videoHeight,
        width: s.videoWidth,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    $(ytplayer.a).addClass(s.customClass).attr('data-player', 'YouTube');
}

function performVimeoTasksAfterReady(c, s) {
    if (s.autoPlay) {
        return methods.play.apply(c.get(0));
    }
}

var ytplayer; //Make this global so that the player is accessable 
//Automatically called from youtube video when it's ready.
function onYouTubePlayerAPIReady() {
    $('body').attr('data-youtube-api-appended', 'true');
    $('body').attr('data-youtube-api', 'ready');
}

function onPlayerStateChange(playerid, newstate, oldstate) {
    var events = playerid.data;
    return methods.stateFunctions.apply($(this), [events, $(ytplayer.a), playerid]);
}

function onPlayerReady(event) {
    $('body').attr('data-youtube-api', 'ready');
    if (settings.autoPlay) {
        event.target.playVideo();
    }
    return methods.stateFunctions.apply($(this), [-1, $(ytplayer.a), event]);
}