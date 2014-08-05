**Note:** This is a re-structured version of https://github.com/ericam/compass-animate.


LoadVideo
===============


This plugin was build to automatically load videos for Vimeo & YouTube.
Eric Meyer's [animate.css][animate]
by [shannonhochkins]. This plugin will not work without compass.


## Usage

```
// *.js
$('.element').loadVideo({
    autoPlay: false,
    urlOrId: null, //Can pass either full url or flat ID
    videoLocation: 'Vimeo', //Can be set to Vimeo or Youtube
    videoWidth: 500, //Can be set to 'fill'        
    videoHeight: 450, //Can be set to 'fill'
    customClass: 'videoContainer', // Add this to your new iframe that the plugin will create.
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


[shannonhochkins]: http://www.shannonhochkins.com/



