(function executeRule(current, previous /*null when async*/ ) {
	var triggerId = current.schedule;
	if (!triggerId.nil()) {
		var scheduledJobRecord = new GlideRecord('sys_trigger');
		if (scheduledJobRecord.get(triggerId)) {
			scheduledJobRecord.deleteRecord();
			gs.addInfoMessage("Deleted associated Scheduled Job " + triggerId);
		}
	}
    gs.setRedirect("/sys_dm_update_list.do");

})(current, previous);
