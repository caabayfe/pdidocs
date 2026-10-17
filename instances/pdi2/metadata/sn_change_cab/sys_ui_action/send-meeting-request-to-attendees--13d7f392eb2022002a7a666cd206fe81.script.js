function showConfirmationPopup() {
	var dialog = new GlideModal('sn_change_cab_attendee_notifications_popup');
	dialog.setTitle(new GwtMessage().getMessage('Send meeting notifications'));
    dialog.setPreference('sendToNew',  sendNotificationsToNewAttendees.bind(this, dialog));
    dialog.setPreference('sendToAll',  sendNotificationsToAll.bind(this, dialog));
	dialog.render();
}

function sendNotificationsToNewAttendees(dialog) {
	dialog.destroy();
	gsftSubmit(null, g_form.getFormElement(), 'sn_change_cab_notify_new_attendees');
}

function sendNotificationsToAll(dialog) {
	dialog.destroy();
	gsftSubmit(null, g_form.getFormElement(), 'sn_change_cab_notify_all_attendees');
}
