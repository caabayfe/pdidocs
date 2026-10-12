deleteCurrentApplication();

function deleteCurrentApplication() {
	//if the current app is set to the one being deleted, then set
	//the current app to none
	var currentApp = gs.getCurrentApplicationId();
	if (currentApp && currentApp == current.sys_id)
		gs.setCurrentApplicationId('global'); // will send a UI notification
	else {
		// send UI notification to remove the entry for the deleted app from the picker
		var n = new UINotification('application_change');
		n.setAttribute('update_only', 'true');
		n.send();
	}
}
