(function($sp, input, data, options, gs) {
	function extend(obj, src) {
		Object.keys(src).forEach(function(key) {
			obj[key] = src[key];
		});
		return obj;
	}
	
	var CHANGE_REQUEST = "change_request";
	var CAB_WORKBENCH = "cab_workbench";
	
	extend(data, {
		userId: gs.getUserID(),
		table: CHANGE_REQUEST,
		sys_id: "-1",
		isNewRecord: true,
		isValid: false,
		canWrite: false,
		canAttach: false,
		view: CAB_WORKBENCH,
		isAdmin: gs.hasRightsTo('sp/configure.all/execute', null),
		emptyStateTemplate: options.empty_state_template,
		disableUIActions: true,
		hideRelatedLists: true
	});
	
	data.i18n = {
		tabLabel: {
			change: gs.getMessage("Change")
		}
	};
	
	
})($sp, input, data, options, gs);
