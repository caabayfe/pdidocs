var DiscoveryJobUtilCore = Class.create();
DiscoveryJobUtilCore.prototype = {
    initialize: function() {},
    /*
     * Validates if technique exists
     */
    isTechniqueAValidRecord: function(sysId) {
        var gr = new GlideRecord('dp_technique_with_params');
        return gr.get(sysId);
    },

    type: 'DiscoveryJobUtilCore'
};
