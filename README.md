getVideo
===============
This jquery plugin was created to automate the api for YouTube & Vimeo videos, it handles callbacks, methods and just general control over the main video through javascript, created by [shannon hochkins]. Currently, this ONLY works for YouTube & Vimeo, if you would like to request a specific new network, please contact me and let me know :)
[shannon hochkins]: http://www.shannonhochkins.com/

Defaults
--------------

```javascript
$('.element').getVideo({
    autoPlay: false,
    urlOrId: null,
    videoLocation: 'YouTube',
    width: 500,
    height: '100%',
    customClass: 'videoContainer',
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
});
```


Options
--------------


| Options               | Type                 | Description  |
| --------------------- |:--------------------:| ------------:|
| autoPlay              | bool                 | Determines if the video should start playing straight away. |
| urlOrId               | string               | This can be either the url or the ID of the video, the plugin will figure everything out. |
| videoLocation         | string               | Just a secondary option to tell the plugin where the video is coming from. |
| width                 | string/int           | This is the width of the video that will be created. Can be INT or STRING. |
| height                | string/int           | This is the height of the video that will be created. Can be INT or STRING. |
| customClass           | string               | A class that will be added to the wrapper container. |
| showRelatedVideos     | bool                 | This determines if after the video has finished, if related videos should appear or not. **YouTube only**. |
| replace               | bool                 | If set to true, the iframe will replace all the html inside the element the plugin was run on. |
| onInit                | function             | Callback once all the initial settings have been processed, these settings are then passed to the init callback |
| beforeLoad            | function             | Callback before the player is generated. |
| onPause               | function             | Callback when the user presses pause on the player. |
| onVideoEnd            | function             | Callback when the video reaches the end of it's timeline. |
| onReady               | function             | Callback when the video is ready to be played. |
| onSeek                | function             | Callback when the video is changing it's location on the timeline. |
| onPlay                | function             | Callback when the video is played. |
| onDestroy             | function             | Callback when the video/plugin is destroyed. |



Examples
--------------

### Basic

##### HTML
```html
<div class="videoWrapper">
    <span> foo </span>
</div>
```
##### JAVASCRIPT

```javascript
$('.videoWrapper').getVideo({
    urlOrId: 'https://www.youtube.com/watch?v=dpW-Lb_R1Io&list=UU-2i8MqA4cILtRIsSK1K3DQ',
    autoPlay: true
});
// Or Simpler:
$('.videoWrapper').getVideo({
    urlOrId: 'dpW-Lb_R1Io',
    autoPlay: true
});

```
The above will generate the YouTube iframe html, and insert it into the videoWrapper element similar to this:

```html
<div class="videoWrapper">
    <span> foo </span>
    <iframe id="dpW-Lb_R1IoContainer"><!-- YouTube data here --></iframe>
</div>
```

### Advanced


##### HTML
```html
<div class="videoWrapper loading">
    
</div>
```
##### JAVASCRIPT

```javascript
var video = $('.videoWrapper');
video.getVideo({
    urlOrId: 'https://www.youtube.com/watch?v=dpW-Lb_R1Io&list=UU-2i8MqA4cILtRIsSK1K3DQ',
    autoPlay: true,
    replace: true,
    onInit: function(container) {
        // Container is quite literally just the element the plugin was run on, in this case, container would equal the var `video` which we defined earlier.
        console.log('Called once plugin settings are defined');
        // On ALL callbacks, we have access to the entire plugin & all it's data.
        // Example:
        var plugin = this;
        plugin.iframe.addClass('someClass');
    },
    onReady: function(player) {
        video.removeClass('loading');
        // Start the video from 12 seconds once it's ready.
        video.getVideo('seekTo', 12);
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        // Example, this allows you to access methods that I have not created the functionality for, example:
        player.mute(); // YouTube only.
        // For a full list of functions available through the YouTube API, please visit: https://developers.google.com/youtube/js_api_reference#Functions
        var plugin = this;
        var defaults = plugin._defaults;
        var mySettings = plugin.settings;
        plugin.element.addClass('thisIsTheVideoWrapper');
        // We can even access all the public methods for video from here if it's ready:
        plugin.play();
        plugin.seekTo(12);
        // We can even access the ytplayer like so:
        plugin.getAllData().ytplayer.unMute(); // YouTube only.
        // This is the same as player.unMute(); // YouTube only.
    },
    beforeLoad: function(container){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called before we start doing anything with the plugin.');
    },
    onPause: function(player){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called when the video is paused.');
    },
    onVideoEnd: function(player){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called when the video is finished.');
    },
    onSeek: function(player){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called when the video timeline changes.');
    },
    onPlay: function(player){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called when the video plays.');
    },
    onDestroy: function(player){
        // For Vimeo videos, player equals the iframe of the video
        // For YouTube videos, player equals the ytplayer object.
        console.log('Called when the video & plugin is destroyed.');
    }
});
```


Api
--------------
##### HTML
```html
<div class="videoWrapper"></div>
```
##### JAVASCRIPT

```javascript
var video = $('.videoWrapper');
video.getVideo({
    urlOrId: 'dpW-Lb_R1Io',
    autoPlay: true
});
```
Once the initial plugin is defined, we can access methods like so:

- To play the video:
```javascript 
video.getVideo('play');
```
- To pause the video:
```javascript 
video.getVideo('pause');
```
- To seek to a 12 seconds into the video:
```javascript 
video.getVideo('seekTo', 12);
```
- To destroy the video
```javascript 
video.getVideo('destroy');
```
- To get all the plugin data
```javascript 
var plugin = video.getVideo('getAllData');
plugin.ytplayer.mute();
console.log((plugin.settings.isYouTube ? 'yes' : 'no'));
```
- To check if it exists:
```javascript 
video.getVideo('exists');
// returns object {exists: true, data: data}
```
- To restart the video:
```javascript 
video.getVideo('restart');
```



Url Formats
--------------

So far I believe I cover the following url formats that can be passed to the urlOrID option. It may handle more than this! :)


```html
//player.vimeo.com/video/12345678
http://player.vimeo.com/video/12345678
http://vimeo.com/12345678
http://vimeo.com/channels//12345678
http://vimeo.com/groups//videos/12345678
http://www.youtube.com/watch?v=165sdfg1651&feature=feedrec_grec_index
http://www.youtube.com/user/IngridMichaelsonVEVOp/a/u/1/165sdfg1651
http://www.youtube.com/v/165sdfg1651?fs=1&amp;hl=en_US&amp;rel=0
http://www.youtube.com/watch?v=165sdfg1651#t=0m10s
http://www.youtube.com/embed/165sdfg1651?rel=0
http://www.youtube.com/watch?v=165sdfg1651
http://www.youtube.com./watch?v=165sdfg1651       
https://youtube.googleapis.com/v/165sdfg1651
http://youtu.be/0zM3nApSvMg

```





