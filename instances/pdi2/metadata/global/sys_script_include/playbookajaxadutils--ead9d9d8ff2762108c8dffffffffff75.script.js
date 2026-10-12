var PlaybookAjaxADUtils = Class.create();
PlaybookAjaxADUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getPublicPDsUsingAD: function() {
        var adSysId = this.getParameter('sys_id');
        if (!adSysId) {
            gs.error("Invalid sys_id format provided");
        }
        var result = PDUtils.findPublicPDsByActivityDefinition(adSysId);
        return JSON.stringify(result);
    },

    isFormBasedActivityType: function() {
        var activityTypeSysId = this.getParameter('sys_id');

        if (!activityTypeSysId) {
            return 'false';
        }
		return PDUtils.isFormBasedActivityType(activityTypeSysId) ? 'true' : 'false';

    },

    type: 'PlaybookAjaxADUtils'
});
