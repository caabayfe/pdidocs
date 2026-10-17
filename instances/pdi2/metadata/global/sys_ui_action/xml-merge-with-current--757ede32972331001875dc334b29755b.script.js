function xmlMergeWithCurrent() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	//get the history versions to use
	var hvGR = new GlideRecord("sys_sync_history_version");
	hvGR.addQuery("sys_id", sysId);
	hvGR.addQuery("state", "collision");
	hvGR.query();
	if (hvGR.next()) {
		//Get pulled version from history version
		var vGR = new GlideRecord("sys_update_version");
		vGR.addQuery("sys_id", hvGR.version);
		vGR.query();
		if (!vGR.next()) {
			alert(getMessage("This version cannot be merged because it cannot be found"));
		} else {
			//Get the current version to compare against
			var cvGR = new GlideRecord("sys_update_version");
			cvGR.addQuery("name", vGR.name);
			cvGR.addQuery("state", "current");
			cvGR.query();
			if (!cvGR.next()) {
				alert(getMessage("This version cannot be merged because the current version cannot be found"));
			} else {
				var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
				var dialog = new dialogClass('merge');
				dialog.setTitle(new GwtMessage().getMessage("Merge with Current"));
				dialog.setWidth("95%");
				dialog.setPreference("new_payoad", vGR.payload);
				dialog.setPreference("old_payoad", cvGR.payload);
				dialog.setPreference("collision_version_id", hvGR.version);
				dialog.render();
			}
		}
	}
	else {
		alert(getMessage("This version cannot be merged because it is not in the Collision state"));
	}
}
function createMergeViewPane(answer) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('merge');
	dialog.setTitle(new GwtMessage().getMessage("Merge with Current"));
	dialog.setWidth("95%");
	dialog.setHeight("95%");

	answer.evalScripts(true);
	dialog.render();
}
