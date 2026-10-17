(function executeRule(current, previous /*null when async*/) {
		
	var activities = new GlideRecord("sys_pd_derivative");
	activities.addQuery("activity_definition.sys_id", current.sys_id);
	activities.query();

	var playbooks = [];
	while (activities.next()) {
		playbooks.push(activities.getDisplayValue("process_definition"));
	}

	if (playbooks.length) {
		var errorMessage = gs.getMessage('Activity definition "{0}" is currently being used in the following playbooks and cannot be deleted.', [current.label]);
		gs.addErrorMessage(errorMessage + '<ul><li>' + playbooks.join('</li><li>') + '</li></ul>');
		current.setAbortAction(true);
	}
})(current, previous);
