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


Documentation
--------------

Options | Description | Default

--- | --- | ---

autoPlay | Determines if the video should start playing straight away. | false


| Options        | Default           | Description  |
| ------------- |:-------------:| -----:|
| autoPlay | false | Determines if the video should start playing straight away.  |
| urlOrId | null | This can be either the url or the ID of the video, the plugin will figure everything out |




| Options         | Default               | Description | 
| ----------------|:---------------------:|-------------|
| autoPlay        | false                 | Determines if the video should start playing straight away. |
| urlOrId         | null                  | This can be either the url or the ID of the video, the plugin will figure everything out. |
| videoLocation   | 'Vimeo'               | Only necessary if only the video ID has been set in ***urlOrId***, otherwise the location is automatically determined. |
| videoWidth      | 500                   | This is the width of the video that will be created. |
| videoHeight     | 450                   | This is the height of the video that will be created. |
| customClass     | 'videoContainer'      | A class that will be added to the wrapper container. |
| onPause         | function() {}         | Callback when the user presses pause on the player. |
| beforeLoad      | function() {}         | Callback before the player is generated. |
| onVideoEnd      | function() {}         | Callback when the player finishes playing. |
| onReady         | function() {}         | Callback when the player is ready to be played. |
| onRestart       | function() {}         | Callback when the player is replayed or restarted. |
| onPlay          | function() {}         | Callback when the player is played. |
| onStop          | function() {}         | Callback when the player is stopped. |
| onUnload        | function() {}         | callback when the player is unloaded. |





