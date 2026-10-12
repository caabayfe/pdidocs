var DataExtractionDebugUtil = Class.create();
DataExtractionDebugUtil.prototype = {
    initialize: function() {
        this.LOG_PREFIX = "com.glide.platform_ml: ";
    },

    debug: function(msg) {
        gs.debug(this.LOG_PREFIX + msg);
    },

    type: 'DataExtractionDebugUtil'
};
