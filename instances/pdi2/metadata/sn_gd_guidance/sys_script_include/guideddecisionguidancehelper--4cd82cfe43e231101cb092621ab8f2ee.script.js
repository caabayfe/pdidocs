var GuidedDecisionGuidanceHelper = Class.create();
GuidedDecisionGuidanceHelper.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    pluginInfo: function() {
        return GlidePluginManager.isActive("sn_gd_core");
    },

    type: 'GuidedDecisionGuidanceHelper'
});
