(function($) {
    lv_methods = {
        vars: {
            ytplayer: null
        },
        init: function(options) {
            //Empty the container so that we have what we need.
            var container = $(this).empty(),
                defaults = {
                    autoPlay: false,
                    urlOrId: null, //Can pass either full url or flat ID
                    videoLocation: 'YouTube', //Can be set to Vimeo or Youtube
                    videoWidth: 500,
                    videoHeight: 450,
                    customClass: 'videoContainer', // Add this to your new iframe that the plugin will create.
                    showRelatedVideos: false,
                    onInit: function(settings) {},
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
            settings.isYouTube = settings.videoLocation.toLowerCase() == 'youtube';
            // Setup our videoID variable
            var matchedInfo = lv_methods.matchID.apply(container.get(0), ['' + settings.urlOrId]);
            matchedInfo.type = (matchedInfo.type == null ? settings.videoLocation.toLowerCase() : matchedInfo.type);
            // Set our videoID variable
            settings.videoID = matchedInfo.id;
            // May override your setting depending on input of urlOrID variable.
            settings.isYouTube = (matchedInfo.type.toLowerCase() == 'youtube');

            settings.onInit.apply(this, [settings]);

            if (settings.videoID == 'Error') {
                container.html('variable urlOrId is not correct, please check you have parsed the right information.');
            } else {
                if (settings.isYouTube) {
                    $('body').attr('data-youtube-api', 'waiting');
                    $('body').removeAttr('data-vimeo-api');
                    if ($('body[data-youtube-api-appended]').length == 0) {
                        $('head').append('<script type="text/javascript" id="youTubeAPIScript" src="http://www.youtube.com/iframe_api"></script>');
                    }
                    lv_methods.drawIframe.apply(container, [settings]);
                    var youTubeTimer = setInterval(function() {
                        if ($('body').attr('data-youtube-api') == 'ready' || $('body[data-youtube-api-appended]').length > 0) {
                            clearInterval(youTubeTimer);
                            lv_methods.buildYouTubeContainer(container, settings);
                        }
                    }, 200);
                } else {
                    if (window.addEventListener) {
                        window.addEventListener('message', lv_methods.callbacks.vimeo.onMessageReceived, false);
                    } else {
                        window.attachEvent('onmessage', lv_methods.callbacks.vimeo.onMessageReceived, false);
                    }
                    $('body').attr('data-vimeo-api', 'waiting');
                    lv_methods.drawIframe.apply(container, [settings]);
                    var vimeoTimer = setInterval(function() {
                        if ($('body').attr('data-vimeo-api') == 'ready') {
                            clearInterval(vimeoTimer);
                            lv_methods.performVimeoTasksAfterReady(container, settings);
                        }
                    }, 200);
                }
            }
        },
        play: function() {
            (lv_methods.checkPlayer.apply(this)) ? lv_methods.vars.ytplayer.playVideo() : lv_methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
        },
        pause: function() {
            (lv_methods.checkPlayer.apply(this)) ? lv_methods.vars.ytplayer.pauseVideo() : lv_methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['pause']);
        },
        stop: function() {
            var iframe = $(this);
            iframe.html(iframe.html());
            lv_methods.stateFunctions.apply(this, ['stop', iframe, this]);
        },
        unload: function() {
            $(this).empty();
            lv_methods.stateFunctions.apply(this, ['unload', $(this), this]);
        },
        seekTo: function(time) {
            var player = $(this);
            if (typeof(time == 'undefined')) {
                time = 0;
            }
            if (lv_methods.checkPlayer.apply(this)) {
                lv_methods.vars.ytplayer.seekTo(time);
                //Youtube api has no return from the above event, forcing attr
                return lv_methods.stateFunctions.apply(lv_methods.vars.ytplayer, ['youtubeSeek', player, this]);
            } else {
                lv_methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', time]);
            }
        },
        restart: function() {
            var player = $(this);
            if (lv_methods.checkPlayer.apply(this)) {
                lv_methods.vars.ytplayer.seekTo(0);
                lv_methods.vars.ytplayer.playVideo();
                //Youtube api has no return from the above event, forcing attr
                return lv_methods.stateFunctions.apply(lv_methods.vars.ytplayer, ['youtubeSeek', player, this]);
            } else {
                lv_methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
                lv_methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', 0]);
            }
        },
        drawIframe: function(settings) {
            // This iframe draw method is used by both Vimeo & YouTube, keep that in mind when adding here.
            var apiName = (settings.isYouTube == true ? 'enablejsapi' : 'api');
            var urlName = (settings.isYouTube == true ? '//www.youtube.com/embed/' : 'http://player.vimeo.com/video/');
            var plyName = (settings.isYouTube == true ? 'YouTube' : 'Vimeo');
            var src = urlName + settings.videoID + '?' + apiName + '=1&player_id=' + settings.videoID + 'Container';
            $(this).html('<iframe data-player="' + plyName + '" id="' + settings.videoID + 'Container" class="' + settings.customClass + '" src="' + src + '" width="' + settings.videoWidth + '" height="' + settings.videoHeight + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
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
        buildYouTubeContainer: function(c, s) {
            c.html('<div id="' + s.videoID + 'Container"></div>');
            lv_methods.vars.ytplayer = new YT.Player(s.videoID + 'Container', {
                videoId: s.videoID,
                height: s.videoHeight,
                width: s.videoWidth,
                playerVars: {
                    rel: (s.showRelatedVideos ? 1 : 0)
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            $(lv_methods.vars.ytplayer.a).addClass(s.customClass).attr('data-player', 'YouTube');
        },
        performVimeoTasksAfterReady: function(c, s) {
            if (s.autoPlay) {
                return lv_methods.play.apply(c.get(0));
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
            var results = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|\.com\.))?/);
            var determineLocation = url.match(/(vimeo|youtu)/);
            var type = null;
            if (determineLocation != null) {
                if (typeof(determineLocation[0]) != 'undefined') {
                    type = (determineLocation[0].indexOf('vimeo') > -1 ? 'vimeo' : ((determineLocation[0].indexOf('youtu') > -1 ? 'youtube' : null)))
                }
            }
            // Set the default to youtube.                
            // Search for vimeo in the match.
            if (RegExp.$3.indexOf('vimeo') > -1) {
                type = 'vimeo';
            }
            if (RegExp.$3.indexOf('youtu') > -1) {
                type = 'youtube';
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
        },
        callbacks: {
            vimeo: {
                // Handle messages received from the player
                onMessageReceived: function(e) {
                    var data = JSON.parse(e.data);
                    if (typeof data.player_id != 'undefined') {
                        var player = $('iframe#' + data.player_id);
                        if (player.length) {
                            lv_methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'pause']);
                            lv_methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'finish']);
                            lv_methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'play']);
                            lv_methods.vimeoApiFunctions.apply(player.get(0), ['addEventListener', 'seek']);
                            return lv_methods.stateFunctions.apply(player, [data.event, player, e]);
                        } else {
                            $.error('Couldnt find iframe');
                        }
                    } else {
                        $.error('Vimeo player_id was not found, is your video private?')
                    }
                }
            }
        }
    };

    $.fn.loadVideo = function(methodOrOptions) {
        var $this = this;

        if (lv_methods[methodOrOptions]) {
            //Apply methods
            return lv_methods[methodOrOptions].apply($this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to init if no method
            return lv_methods.init.apply($this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.loadVideo');
        }
    };

})(jQuery);

//Automatically called from youtube video when it's ready.
function onYouTubePlayerAPIReady() {
    $('body').attr('data-youtube-api-appended', 'true');
    $('body').attr('data-youtube-api', 'ready');
}

function onPlayerStateChange(playerid, newstate, oldstate) {
    var events = playerid.data;
    return lv_methods.stateFunctions.apply($(this), [events, $(lv_methods.vars.ytplayer.a), playerid]);
}

function onPlayerReady(event) {
    $('body').attr('data-youtube-api', 'ready');
    if (settings.autoPlay) {
        event.target.playVideo();
    }
    return lv_methods.stateFunctions.apply($(this), [-1, $(lv_methods.vars.ytplayer.a), event]);
}