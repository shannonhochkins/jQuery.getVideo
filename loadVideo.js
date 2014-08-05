(function( $ ){
    methods = {
        init : function(options) {
            //Empty the container so that we have what we need.
            var container = $(this).empty(),
                defaults = {        
                    autoPlay : false, 
                    urlOrId : null, //Can pass either full url or flat ID
                    videoLocation: 'Vimeo', //Can be set to Vimeo or Youtube
                    videoWidth: 500, //Can be set to 'fill'        
                    videoHeight: 450, //Can be set to 'fill'
                    customClass : 'videoContainer', // Add this to your new iframe that the plugin will create.
                    onPause : function() {},
                    beforeLoad : function() {},
                    onVideoEnd : function() {},
                    onReady : function() {},
                    onRestart : function() {},
                    onPlay : function() {},
                    onStop : function() {},
                    onUnload : function() {},
                    getMatchedVideo : function (id) {}
                },
                attrs;

            settings = $.extend({}, defaults, options);
            // Call before load before we doing anything
            settings.beforeLoad.call(container.get(0));
            // Setup our containers for youtube or vimeo depending on settings.videoLocation            
            settings['isYouTube'] = settings.videoLocation.toLowerCase() == 'youtube';
            //Setup our videoID variable
            var matchedInfo = methods.matchID.apply(container.get(0), [settings.isYouTube, settings.urlOrId]);
            // Set our videoID variable
            settings['videoID'] = matchedInfo.id;
            // May override your setting depending on input of urlOrID variable.
            settings.isYouTube = matchedInfo.loc;

            // Override video width or height if settings is set to 'fill'
            if ((settings.videoWidth == 'fill') || (settings.videoHeight == 'fill')) {                
                settings.videoWidth = '100%';
                settings.videoHeight = '100%';                
            }

            if (settings.videoID == 'Error'){
                container.html('variable urlOrId is not correct, please check you have passed the right information.');
            } else {
                if (settings.isYouTube) {
                    $('body').attr('data-youtube-api', 'waiting');
                    $('body').removeAttr('data-vimeo-api');
                    if ($('body[data-youtube-api-appended]').length == 0){                        
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
        play : function() {
            (methods.checkPlayer.apply(this)) ? ytplayer.playVideo() : methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
        },
        pause : function() {                 
            (methods.checkPlayer.apply(this)) ? ytplayer.pauseVideo() : methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['pause']);
        },
        stop : function() {
            var iframe = $(this);
            iframe.html(iframe.html());
            methods.stateFunctions.apply(this, ['stop']);
        },
        unload : function() {
            $(this).empty();
            methods.stateFunctions.apply(this, ['unload']);
        },
        seekTo : function(time){
            var player = $(this);
            if (typeof(time == 'undefined')) {
                time = 0;
            }
            if (methods.checkPlayer.apply(this)) {                
                ytplayer.seekTo(time);
                //Youtube api has no return from the above event, forcing attr
                return methods.stateFunctions.apply(ytplayer, ['youtubeSeek']);
            } else {                
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', time]);                
            }
        },
        restart : function() {
            var player = $(this);
            if (methods.checkPlayer.apply(this)) {                
                ytplayer.seekTo(0);
                ytplayer.playVideo();
                //Youtube api has no return from the above event, forcing attr
                return methods.stateFunctions.apply(ytplayer, ['youtubeSeek']);
            } else {                
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['play']);
                methods.vimeoApiFunctions.apply($(this).find('iframe').get(0), ['seekTo', 0]);                
            }
        },
        drawIframe : function() { 
            var apiName = (settings.isYouTube ? 'enablejsapi' : 'api');
            var urlName = (settings.isYouTube ? 'http://www.youtube.com/embed/' : 'http://player.vimeo.com/video/');
            var plyName = (settings.isYouTube ? 'YouTube' : 'Vimeo');
            $(this).html('<iframe data-player="'+plyName+'" id="'+settings.videoID+'Container" class="'+settings.customClass+'" src="'+urlName+settings.videoID+'?'+apiName+'=1&player_id='+settings.videoID+'Container" width="'+settings.videoWidth+'" height="'+settings.videoHeight+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
        },
        checkPlayer : function() {
            return ($(this).find('iframe').attr('data-player') == 'YouTube');
        },        
        stateFunctions: function (state, options){   
            switch (state) {
                case -1:
                case 'ready':
                    if (settings.isYouTube) {
                        $('body').attr('data-youtube-api', 'ready');
                    } else {
                        $('body').attr('data-vimeo-api', 'ready');
                    }
                    settings.onReady.call(this);
                break;
                case 0:
                case 'finish':
                    settings.onVideoEnd.call(this);                          
                break;
                case 1:  
                case 'play':                          
                    settings.onPlay.call(this);                           
                break;
                case 'stop':
                    settings.onStop.call(this);
                case 'unload':
                    settings.onUnload.call(this);
                case 2:
                case 'pause':
                    settings.onPause.call(this);                    
                break;
                case 'youtubeSeek':
                case 'seek':
                    settings.onRestart.call(this);
                case 'returnID':
                    settings.getMatchedVideo.call(this, options);
                default:
                    settings.beforeLoad.call(this);
            }
        },
        vimeoApiFunctions : function(action, value) {
            var data = { method: action },
                url = $(this).attr('src').split('?')[0];             
            if (value) {data.value = value;}
            $(this).get(0).contentWindow.postMessage(JSON.stringify(data), url);
        },
        matchID : function(locIsYoutube, urlOrId){            
            var vimeoRegExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/,
                youTubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
                urlOrId = String(urlOrId); // Force string ID


            if (urlOrId.indexOf("yout") != -1) {
                matched = urlOrId.match(youTubeRegExp);
                if (matched && matched[2].length == 11) {
                    urlOrId = matched[2];
                    locIsYoutube = true;
                } else {
                    if (urlOrId.length != 11) {
                        urlOrId = "Error";
                    }
                }
            } else if (urlOrId.indexOf("vimeo") != -1) {
                matched = vimeoRegExp.exec(urlOrId);
                if (matched && urlOrId.match("^\\d*$") !== 'null') {
                    urlOrId = matched[5];
                    locIsYoutube = false;
                } else {
                    urlOrId = 'Error';
                }
            } else {
                // No full URL found, matching ID from variable
                if (locIsYoutube) {
                    if (urlOrId.length != 11) {
                        urlOrId = "Error";
                    }
                } else {
                    if (urlOrId.match("^\\d*$") === null) {
                        urlOrId = "Error";
                    }
                }
            }         
            methods.stateFunctions.apply(this, ['returnID', urlOrId]);   
            result = {
                'id' : urlOrId,
                'loc' : locIsYoutube
            };
            return result;
        }
    };

    $.fn.loadVideo = function(methodOrOptions) {   
        var $this = this;

        if (methods[methodOrOptions]) {
            //Apply methods
            return methods[ methodOrOptions ].apply( $this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to init if no method
            return methods.init.apply( $this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.loadVideo' );
        }
    };

})( jQuery);

// Listen for messages from the vimeo player
if (window.addEventListener){
    window.addEventListener('message', onMessageReceived, false);
}
else {
    window.attachEvent('onmessage', onMessageReceived, false);
}

// Handle messages received from the player
function onMessageReceived(e) {
    if ($('body[data-youtube-api]').length == 0) {
        var data = JSON.parse(e.data);
        var vim = $('#' + data.player_id).get(0);  
        methods.vimeoApiFunctions.apply(vim,['addEventListener', 'pause']);
        methods.vimeoApiFunctions.apply(vim,['addEventListener', 'finish']);
        methods.vimeoApiFunctions.apply(vim,['addEventListener', 'play']);
        methods.vimeoApiFunctions.apply(vim,['addEventListener', 'seek']);
        return methods.stateFunctions.apply(vim, [data.event]);
    }
}

function buildYouTubeContainer(c, s) {
    c.html('<div id="'+s.videoID+'Container"></div>');
    ytplayer = new YT.Player(s.videoID + 'Container', {
        videoId : s.videoID,
        height : s.videoHeight,
        width : s.videoWidth,
        events : {                                
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

function onPlayerStateChange(newState) {
    var events = newState.data;
    return methods.stateFunctions.apply($(this), [events]);
}
function onPlayerReady(event) {
    $('body').attr('data-youtube-api', 'ready');
    if (settings.autoPlay) {
        event.target.playVideo();
    } 
    return methods.stateFunctions.apply($(this), [-1]);
}
