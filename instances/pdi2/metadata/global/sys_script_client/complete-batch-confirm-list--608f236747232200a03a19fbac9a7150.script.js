function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	var saveAndClose = true;
	if (newValue != "complete")
		callback(saveAndClose); 
	else {
		if (checkForHierarchy(sysIDs, callback))
			callback(saveAndClose); 
	}
}

function checkForHierarchy(sysIDs, callback) {
	var openChildren = new GlideRecord("sys_update_set");
	openChildren.addQuery("base_update_set", "IN", sysIDs);
	openChildren.addQuery("state", "in progress");
	openChildren.addQuery("parent", "!=", "");
	openChildren.query();
	if (!openChildren.next())
		return true;
	
	var dialog = new GlideModal('glide_modal_confirm', true, 300);
	dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
	dialog.setPreference('body', new GwtMessage().format("This will complete all update sets in the batch. Continue changing state to complete?"));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('onPromptComplete', doComplete);
	dialog.setPreference('onPromptCancel', doCancel);
	dialog.render();
	
	function doComplete() {
		callback(true);
	}
	
	function doCancel() {
		callback(false);
	}
}
