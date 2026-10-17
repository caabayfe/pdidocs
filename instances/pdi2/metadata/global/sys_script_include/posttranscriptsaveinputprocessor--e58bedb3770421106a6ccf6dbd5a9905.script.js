var PostTranscriptSaveInputProcessor = Class.create();
PostTranscriptSaveInputProcessor.prototype = {
    initialize: function() {},
    process: function(input) {
        return input;
    },

    shouldPause: function(input) {
        return false;
    },

    type: 'PostTranscriptSaveInputProcessor'
};
