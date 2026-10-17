var MobileGlideSignalsService = Class.create();
MobileGlideSignalsService.prototype = {
    initialize: function() {},

    trackGeniusResultEventAsync: function(payload) {
        new GlideSignalsService().trackEventAsync("GENIUS_RESULT_EVENT", "INFO", payload);
    },
    type: 'MobileGlideSignalsService'
};
