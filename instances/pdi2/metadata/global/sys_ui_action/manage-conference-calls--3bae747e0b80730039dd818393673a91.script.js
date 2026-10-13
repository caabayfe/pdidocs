function openManageConferenceDialog(){
	var notifyOnTask = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
	notifyOnTask.setCancelCallback(cancelCallback);
	notifyOnTask.openManageConferenceDialog({showAllMsgs: true, reloadPage: true});
}

function cancelCallback() {
}
