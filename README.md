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


| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |









