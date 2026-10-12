var UIRuleActionSkillConfigService = Class.create();
UIRuleActionSkillConfigService.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    checkCapability: function() {
        var capabilityId = this.getParameter('sysparm_capability_id');
        try {
            var apiAttrs = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId);
            var hasMultipleOutputs = (apiAttrs !== null) && (apiAttrs.outputs !== null) && apiAttrs.outputs.length > 1;
            return this._getResult(hasMultipleOutputs);
        } catch (e) {
            return this._getResult(true);
        }
    },

    _getResult: function(hasMultipleOutputs) {
        return JSON.stringify({
            "hasMultipleOutputs": hasMultipleOutputs
        });
    },

    type: 'UIRuleActionSkillConfigService'
});
