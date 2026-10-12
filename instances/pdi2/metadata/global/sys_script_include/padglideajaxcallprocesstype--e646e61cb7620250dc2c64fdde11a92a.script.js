var PADGlideAJAXCallProcessType = Class.create();
PADGlideAJAXCallProcessType.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getFieldValues: function() {
		var padUtils = new PADUtilsSI();
		if (!padUtils.isPADAuthorizedUser())
			return;

		var sysid = this.getParameter("sysparm_sys_id");
		var util = new PDProcessTypeUtil();
		var values = util.getProcessTypeValues(sysid);

		return JSON.stringify(values);
	},

    type: 'PADGlideAJAXCallProcessType'
});
