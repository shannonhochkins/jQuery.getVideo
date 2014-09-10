/*
 *  Project: jquery.getVideo
 *  Description: Plugin to automatically load iframes, and get control over the videos through the respective locations api
 *  Author: Shannon hochkins
 *  License: Free.
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window is passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'getVideo',
        defaults = {
            autoPlay: false,
            urlOrId: null, //Can pass either full url or flat ID
            videoLocation: 'YouTube', //Can be set to Vimeo or Youtube
            width: 500,
            height: '100%',
            customClass: 'videoContainer', // Add this to your new iframe that the plugin will create.
            showRelatedVideos: true,
            replace: false,
            onInit: null,
            beforeLoad: null,
            onPause: null,
            onVideoEnd: null,
            onReady: null,
            onSeek: null,
            onPlay: null,
            onDestroy: null
        };


    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = $(element);
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.$body = $('body');
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            var self = this;
            // empty the container if the replace method is set to true.
            if (self.settings.replace === true) {
                self.element.empty();
            }
            // Call before load before we doing anything
            internal.applyCallback.apply(self, ['beforeLoad', self.element]);
            // Setup our containers for youtube or vimeo depending on settings.videoLocation            
            self.settings.isYouTube = self.settings.videoLocation.toLowerCase() == 'youtube';
            // Setup our videoID variable
            var matchedInfo = internal.matchID.apply(self, ['' + self.settings.urlOrId]);
            matchedInfo.type = (matchedInfo.type == null ? self.settings.videoLocation.toLowerCase() : matchedInfo.type);
            // Set our videoID variable
            self.settings.videoID = matchedInfo.id;
            // If there's still not ID found, return this error.
            if (self.settings.videoID == 'null') {
                return $.error('No id found, please check the urlOrId setting.');
            }
            // May override your setting depending on input of urlOrID variable.
            self.settings.isYouTube = (matchedInfo.type.toLowerCase() == 'youtube');
            // Update the video location if it's different from the passed setting
            self.settings.videoLocation = (self.settings.isYouTube == true ? 'YouTube' : 'Vimeo');
            // If the video already exists with this id, remove and replace with the settings.
            var iframe = $('#' + self.settings.videoID + 'Container');
            if (iframe.length) {
                // If there's currently an iframe with the id, destroy it.
                iframe[pluginName]('destroy');
            }
            // Draw our iframes
            self.iframe = internal.drawIframe.apply(self, [self.settings]);
            // Update the data on the element.
            self = internal.updateNewdata.apply(self);
            // Setup callbacks & listeners
            if (self.settings.isYouTube) {
                // Append the API if it's not already appended
                if ($('#youTubeAPIScript').length == 0) {
                    $('head').append('<script type="text/javascript" id="youTubeAPIScript" src="http://www.youtube.com/iframe_api"></script>');
                }
                // If the API already exists, run the callback to draw the ytwraper.
                if (internal.YouTubeAPIReady) {
                    internal.buildYouTubeContainer.apply(self);
                }
            } else {
                if (window.addEventListener) {
                    window.addEventListener('message', internal.callbacks.vimeo.onMessageReceived, false);
                } else {
                    window.attachEvent('onmessage', internal.callbacks.vimeo.onMessageReceived, false);
                }
            }

        },
        play: function() {
            var $this = this,
                iframe = $this.exists($this);
            if (iframe.exists) {
                var data = iframe.data;
                (data.settings.isYouTube ? internal.methods.youtube('playVideo') : internal.methods.vimeo(data.iframe.get(0), 'play'));
            }
        },
        pause: function() {
            var $this = this,
                iframe = $this.exists($this);
            if (iframe.exists) {
                var data = iframe.data;
                (data.settings.isYouTube) ? internal.methods.youtube('pauseVideo') : internal.methods.vimeo(data.iframe.get(0), 'pause');
            }
        },
        exists: function() {

            var $this = this,
                data = internal.getData($this);
            return {
                exists: (typeof(data) === 'object' ? true : false),
                data: data
            };
        },
        destroy: function() {
            var $this = this,
                iframe = $this.exists($this);
            if (iframe.exists) {
                var data = iframe.data;
                internal.stateFunctions.apply(this, ['destroy', (data.settings.isYouTube ? internal.ytplayer : data.iframe.get(0))]);
                $(data.iframe).remove();
                data.element.removeData('plugin_' + pluginName);
            }
        },
        seekTo: function(time) {
            var $this = this,
                iframe = $this.exists($this),
                time = (typeof(time) == 'undefined' ? 0 : time);
            if (iframe.exists) {
                var data = iframe.data;
                if (data.settings.isYouTube) {
                    internal.methods.youtube('seekTo', time);
                    // Youtube api has no callback for the seek method, forcing callback
                    return internal.stateFunctions.apply($this, ['youtubeSeek', internal.ytplayer]);
                } else {
                    internal.methods.vimeo(data.iframe.get(0), 'seekTo', time);
                }
            }
        },
        restart: function() {
            var $this = this,
                iframe = $this.exists($this);
            if (iframe.exists) {
                var data = iframe.data;
                if (data.settings.isYouTube) {
                    internal.methods.youtube('seekTo', 0);
                    internal.methods.youtube('playVideo');
                    // Youtube api has no callback for the seek method, forcing callback
                    return internal.stateFunctions.apply($this, ['youtubeSeek', internal.ytplayer]);
                } else {
                    internal.methods.vimeo(data.iframe.get(0), 'play');
                    internal.methods.vimeo(data.iframe.get(0), 'seekTo', 0);
                }
            }
        },
        getAllData: function() {
            return internal;
        }

    });


    var internal = {
        callbacks: {
            vimeo: {
                // Handle messages received from the player
                onMessageReceived: function(e) {
                    if (internal.currentPlugin.settings.isYouTube == true) return false;
                    var data = JSON.parse(e.data);
                    if (typeof data.player_id != 'undefined') {
                        var player = $('iframe#' + data.player_id);
                        if (player.length) {
                            internal.methods.vimeo(player.get(0), 'addEventListener', 'pause');
                            internal.methods.vimeo(player.get(0), 'addEventListener', 'finish');
                            internal.methods.vimeo(player.get(0), 'addEventListener', 'play');
                            internal.methods.vimeo(player.get(0), 'addEventListener', 'seek');
                            var container = player.parent();
                            return internal.stateFunctions.apply(container, [data.event, player.get(0)]);
                        } else {
                            $.error('Couldnt find iframe');
                        }
                    } else {
                        $.error('Vimeo player_id was not found, is your video private?')
                    }
                }
            },
            youtube: {
                onPlayerReady: function(event) {
                    if (internal.currentPlugin.settings.isYouTube == false) return false;
                    var settings = internal.currentPlugin.settings;
                    if (settings.autoPlay) {
                        event.target.playVideo();
                    }

                },
                onPlayerStateChange: function(playerid, newstate, oldstate) {
                    if (internal.currentPlugin.settings.isYouTube == false) return false;
                    var events = playerid.data;
                    return internal.stateFunctions.apply(internal.currentPlugin, [events, internal.ytplayer]);

                }
            }
        },
        methods: {
            youtube: function(method, option1) {
                var player = internal.ytplayer;
                if (typeof player != 'undefined') {
                    if (typeof(player[method]) == 'function') {
                        option1 = (typeof option1 == 'undefined' ? 0 : option1);
                        player[method].apply(player, [option1])
                    }
                }
            },
            vimeo: function(iframe, action, value) {
                var data = {
                        method: action
                    },
                    url = $(iframe).attr('src').split('?')[0];
                if (typeof(value) != 'undefined') {
                    data.value = value;
                }
                iframe.contentWindow.postMessage(JSON.stringify(data), url);
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
            this.contentWindow.postMessage(JSON.stringify(data), url);
        },
        getData: function($this) {
            var container = (typeof($this.iframe) == 'undefined' ? $this : $this.iframe);
            if (typeof(container) != 'undefined' && container.data('plugin_' + pluginName)) {
                return container.data('plugin_' + pluginName);
            } else {
                $.error('Couldn\'t locate plugin. Please make sure you\'re calling methods from the correct element.')
            }
        },
        updateNewdata: function() {
            internal.currentPlugin = this;
            this.iframe.data('plugin_' + pluginName, this);
            return this;
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
            // if type still equals null, try to determine the location based on it's ID, if the string only contains numbers, assume vimeo, else YouTube.
            if (type == null) {
                type = (/^\d+$/.test(url) ? 'vimeo' : 'youtube');
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
        drawIframe: function(settings) {
            var self = this;
            // This iframe draw method is used by both Vimeo & YouTube, keep that in mind when adding here.
            var apiName = (settings.isYouTube == true ? 'enablejsapi' : 'api');
            var urlName = (settings.isYouTube == true ? '//www.youtube.com/embed/' : 'http://player.vimeo.com/video/');
            var src = urlName + settings.videoID + '?' + apiName + '=1&player_id=' + settings.videoID + 'Container';
            var iframe = $('<iframe />').attr({
                'data-player': settings.videoLocation,
                'id': settings.videoID + 'Container',
                'class': settings.customClass,
                'src': src,
                'width': settings.width,
                'height': settings.height,
                'frameborder': 0,
                'webkitAllowFullScreen': true,
                'mozallowfullscreen': true,
                'allowFullScreen': true,

            });
            $(this.element).append(iframe);
            // Call the init callback if defined
            internal.applyCallback.apply(self, ['onInit', $(this.element)]);
            return iframe;
        },
        apiReady: function() {
            var self = this;
            if (self.settings.isYouTube) {} else {
                internal.performVimeoTasksAfterReady.apply(self);
            }
        },
        performVimeoTasksAfterReady: function() {
            var self = this,
                data = internal.getData(self);
            if (data.settings.autoPlay) {
                data.play.apply(self);
            }
        },
        buildYouTubeContainer: function() {
            var container = this.element,
                settings = this.settings;

            internal.ytplayer = new YT.Player(settings.videoID + 'Container', {
                videoId: settings.videoID,
                height: settings.height,
                width: settings.width,
                playerVars: {
                    rel: (settings.showRelatedVideos ? 1 : 0)
                },
                events: {
                    'onReady': internal.callbacks.youtube.onPlayerReady,
                    'onStateChange': internal.callbacks.youtube.onPlayerStateChange
                }
            });
            $(internal.ytplayer.a).addClass(settings.customClass).attr('data-player', 'YouTube');
        },
        stateFunctions: function(state, player) {
            var self = internal.getData(this),
                settings = self.settings;
            switch (state) {
                case -1:
                case 'ready':
                    console.log('ready');
                    internal.apiReady.apply(self);
                    internal.applyCallback.apply(self, ['onReady', player]);
                    break;
                case 0:
                case 'finish':
                    console.log('finish');
                    internal.applyCallback.apply(self, ['onVideoEnd', player]);
                    break;
                case 1:
                case 'play':
                    console.log('play');
                    internal.applyCallback.apply(self, ['onPlay', player]);
                    break;
                case 'destroy':
                    console.log('destroy');
                    internal.applyCallback.apply(self, ['onDestroy', player]);
                    break;
                case 2:
                case 'pause':
                    console.log('pause');
                    internal.applyCallback.apply(self, ['onPause', player]);
                    break;
                case 'youtubeSeek':
                case 'seek':
                    console.log('seek');
                    internal.applyCallback.apply(self, ['onSeek', player]);
                    break;
                default:
                    break;
            }
        },
        applyCallback: function(name, player) {
            var callback = this.settings[name];
            if (typeof(callback) == 'function') {
                callback.apply(this, [player]);
            }
        }
    }

    $.fn[pluginName] = function(options) {
        var args = arguments;
        // Is the first parameter an object (options), or was omitted, instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                // Create a new one, pass options to our plugin constructor, and store the plugin instance in the elements jQuery data object. This will overwrite current instances.
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            });
            // If the first parameter is a string and it doesn't start with an underscore or "contains" the `init`-function, treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Cache the method call to make it possible to return a value
            var returns;
            this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                // Tests that there's already a plugin-instance and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    // Call the method of our plugin instance, and pass it the supplied arguments.
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
            // If the earlier cached method gives a value back return the value, otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };

    window.onYouTubePlayerAPIReady = function() {
        if (typeof(internal.YouTubeAPIReady) == 'undefined' || internal.YouTubeAPIReady == false) {
            internal.YouTubeAPIReady = true;
            internal.buildYouTubeContainer.apply(internal.currentPlugin);
        }
    }

}(jQuery, window, document));