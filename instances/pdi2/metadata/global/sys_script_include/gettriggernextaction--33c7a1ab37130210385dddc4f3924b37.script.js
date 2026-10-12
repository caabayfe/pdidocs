var getTriggerNextAction = Class.create();
getTriggerNextAction.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
	getNextAction: function () {
		var sysId = this.getParameter('sysparm_sys_id');
		var triggerGr = new GlideRecord('sys_trigger');
		if (triggerGr.get(sysId)) {
			return triggerGr.getDisplayValue('next_action');
		}
		return null;
	},
	type: 'getTriggerNextAction'
});
