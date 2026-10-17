function onLoad() {
    //Type appropriate comment here, and begin script below
	var canWrite = g_scratchpad.canWrite;
	var canDelete = g_scratchpad.canDelete;
	if (canWrite && canDelete) {
		var c = g_form.getValue('permission');
		g_form.removeOption('permission', 'reader');
		g_form.removeOption('permission', 'writer');
		g_form.removeOption('permission', 'owner');

		g_form.addOption('permission', 'reader', 'Reader', 1);
		g_form.addOption('permission', 'writer', 'Writer', 2);
		g_form.addOption('permission', 'owner', 'Owner', 3);
		g_form.setValue('permission', c);
	} else if (canWrite) {
		var d = g_form.getValue('permission');
		g_form.removeOption('permission', 'reader');
		g_form.removeOption('permission', 'writer');
		g_form.removeOption('permission', 'owner');

		g_form.addOption('permission', 'reader', 'Reader', 1);
		g_form.addOption('permission', 'writer', 'Writer', 2);
		g_form.setValue('permission', d);
	} else {
		if (g_form.isNewRecord()) {
			g_form.removeOption('permission', 'reader');
			g_form.removeOption('permission', 'writer');
			g_form.removeOption('permission', 'owner');
			g_form.addErrorMessage("No Permission to share document");
		}
	}
    
}
