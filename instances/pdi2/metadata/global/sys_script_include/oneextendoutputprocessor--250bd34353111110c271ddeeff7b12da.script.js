var OneExtendOutputProcessor = Class.create();
OneExtendOutputProcessor.prototype = {
    initialize: function() {},

    processCompleted: function(response) {
        sn_one_extend.OneExtendUtil.completed(response);
    },

    processErrored: function(response) {
        sn_one_extend.OneExtendUtil.errored(response);
    },

    processCancelled: function(response) {
        sn_one_extend.OneExtendUtil.cancelled(response);
    },


    type: 'OneExtendOutputProcessor'
};
