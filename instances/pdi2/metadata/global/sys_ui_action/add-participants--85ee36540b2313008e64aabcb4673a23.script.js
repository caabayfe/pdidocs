function onClick() {
	var client = new NotifyOnTaskClient("", "", g_form.getUniqueValue());
	client.openConferenceDialog({showAllMsgs: true, reloadPage: false, addToWorkNotes: true});
}
