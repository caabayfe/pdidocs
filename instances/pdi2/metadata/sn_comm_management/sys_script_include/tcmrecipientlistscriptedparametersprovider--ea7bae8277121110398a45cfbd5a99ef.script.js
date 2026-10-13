var TCMRecipientListScriptedParametersProvider = Class.create();
TCMRecipientListScriptedParametersProvider.prototype = {
    initialize: function() {
    },
	
	canResolveParameters: function(/*GlideRecord*/ emailGr) {
		if (emailGr && new GlideTableHierarchy(emailGr.getValue('target_table')).getHierarchy().indexOf('comm_task') != -1)
			return true;
	},

	/*
	 * Derive parameters required for resolving reciepient list script using reference record on email.
	 */
    resolve: function(/*GlideRecord*/ emailGr) {
		var result = {};
		var commTaskExtensionGr = new GlideRecord(emailGr.target_table + '');
		if (commTaskExtensionGr.get(emailGr.instance + '')) {
			var commPlanGr = commTaskExtensionGr.comm_plan.getRefRecord();
			result = {
				commPlanSysId: commPlanGr.sys_id + '',
				commPlanSourceId: commPlanGr.source + '',
				sourceTable: commPlanGr.source.getRefRecord().getRecordClassName(),
				needOnCallUsers: false
			};
		}
		return result; 
    },

    type: 'TCMRecipientListScriptedParametersProvider'
};
