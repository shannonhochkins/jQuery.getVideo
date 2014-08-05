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










