var OneExtendCapabilitySetupTemplate = Class.create();
OneExtendCapabilitySetupTemplate.prototype = {
    initialize: function() {},

    setup: function(payload) {
        gs.info("got payload :: " + JSON.stringify(payload));
    },

    type: 'OneExtendCapabilitySetupTemplate'
};
