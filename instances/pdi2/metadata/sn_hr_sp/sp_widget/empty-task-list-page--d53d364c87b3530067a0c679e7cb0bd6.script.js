(function() {
	var AWAITING_TRIGGER = 'awaiting_trigger';
	data.isLEInstalled = new GlidePluginManager().isActive('com.sn_hr_lifecycle_events');
	
	data.awaitingTriggerState = AWAITING_TRIGGER;
	data.messages = {
		'NO_TODOS_YET': gs.getMessage('No To-dos Yet'),
		'NO_TODOS_ASSIGNED': gs.getMessage('No To-dos are Assigned'),
		'ALL_TODOS_COMPLETE': gs.getMessage('All To-dos are Complete'),
		'NO_CASE_FOUND': gs.getMessage('No Case Found'),
		'WAIT_FOR_NOTIFICATION': gs.getMessage('Please wait for notification of upcoming to-dos'),
		'NO_TYPE_FILTER_SELECTED': gs.getMessage("The filter produced no results. Please select one or more task types.")
	};
	
	if (input && input.request) {
		checkActivitySetStatus(input.request.selectedSetId);
	}
	
	function checkActivitySetStatus(activitySetID) {
		var leActivitySetContextgr = new GlideRecordSecure('sn_hr_le_activity_set_context');
		if (leActivitySetContextgr.get(activitySetID)) {
			if (leActivitySetContextgr.state == AWAITING_TRIGGER) {
				data.message = gs.getMessage('Please wait for notification of upcoming to-dos');
				data.isFutureState = true;
			}
		}
	}
   
})();
