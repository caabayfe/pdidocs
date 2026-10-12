function showSimulator() {
	var generationType = g_form.getValue('generation_type');
	if (!g_form.getValue('collection') && generationType == 'engine')
		g_form.addErrorMessage(new GwtMessage().getMessage("Table is required to preview this notification"));
	else {
		if (typeof rowSysId == 'undefined')
			 sysId = gel('sys_uniqueValue').value;
		else
			 sysId = rowSysId;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var dd = new dialogClass("notification_preview");
		dd.setTitle(getMessage("Notification Preview"));
		dd.setWidth(800);
		dd.setPreference('sysparm_notification_id', sysId);
		dd.setPreference('sysparm_changed_fields',g_form.serializeChangedAll());
		dd.render();
	}
}
