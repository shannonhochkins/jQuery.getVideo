LoadVideo
===============

This plugin was build to automatically load videos for Vimeo & YouTube.
by [shannon hochkins]. This plugin will not work without compass.
[shannon hochkins]: http://www.shannonhochkins.com/

Usage
--------------

```javascript
$('.element').loadVideo({
    autoPlay: false,
    urlOrId: null,
    videoLocation: 'Vimeo',
    videoWidth: 500,
    videoHeight: 450, 
    customClass: 'videoContainer',
    onPause: function() {},
    beforeLoad: function() {},
    onVideoEnd: function() {},
    onReady: function() {},
    onRestart: function() {},
    onPlay: function() {},
    onStop: function() {},
    onUnload: function() {},
    getMatchedVideo: function(id) {}
});
```


Options
--------------


| Options         | Default                                 | Description  |
| ------------- |:-------------:| -----:|
| autoPlay        | false                               | Determines if the video should start playing straight away. |
| urlOrId         | null                                | This can be either the url or the ID of the video, the plugin will figure everything out. |
| videoLocation   | 'YouTube'                           | Only necessary if only the video ID has been set in ***urlOrId***, otherwise the location is automatically determined. Multicase allowed. |
| videoWidth      | '100%'                              | This is the width of the video that will be created. Can be INT or STRING. |
| videoHeight     | 450                                 | This is the height of the video that will be created. Can be INT or STRING. |
| customClass     | 'videoContainer'                    | A class that will be added to the wrapper container. |
| onPause         | function() {state, player, e}       | Callback when the user presses pause on the player. |
| beforeLoad      | function() {state, player, e}       | Callback before the player is generated. |
| onVideoEnd      | function() {state, player, e}       | Callback when the player finishes playing. |
| onReady         | function() {state, player, e}       | Callback when the player is ready to be played. |
| onSeek          | function() {state, player, e}       | Callback when the player is changing it's location on the timeline. **VIMEO ONLY** |
| onPlay          | function() {state, player, e}       | Callback when the player is played. |
| onStop          | function() {state, player, e}       | Callback when the player is stopped. |
| onUnload        | function() {state, player, e}       | callback when the player is unloaded. |



Url Formats
--------------

So far I believe I cover the following url formats that can be parsed to the urlOrID option. It may handle more than this! :)


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

~~~





