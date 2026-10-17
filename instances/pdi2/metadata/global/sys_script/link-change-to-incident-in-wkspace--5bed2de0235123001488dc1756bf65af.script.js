(function executeRule(current, previous /*null when async*/) {
	var session = gs.getSession();
	var linkData = session.getProperty('change_link');
	session.clearProperty('change_link');

	if (linkData) {
		
		var taskGr = new GlideRecord(linkData.table);
		if (taskGr.get(linkData.sysid)) {
			var incUrl = "<a href='" + taskGr.getLink() + "'>" + taskGr.getDisplayValue() + "</a>";
			taskGr.setValue(linkData.field, current.getUniqueValue());
			var updated = taskGr.update();

			//Return if in Workspace do not show message as is shows on wrong tab
			if (linkData.isWorkspace)
				return;

			if (updated)
				gs.addInfoMessage(gs.getMessage("{0} Change {1} created from {2}", [current.getDisplayValue('type'),  current.getDisplayValue(), incUrl]));
			else
				gs.addInfoMessage(gs.getMessage("{0} Change could not be created from {1}", [current.getDisplayValue('type'), incUrl]));
		}
	}

})(current, previous);
