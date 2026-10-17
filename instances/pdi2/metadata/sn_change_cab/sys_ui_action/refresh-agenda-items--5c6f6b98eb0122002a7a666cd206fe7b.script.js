function sendEmailsOnRefreshAI() {
	var dialog = new GlideModal('sn_change_cab_send_attendee_notifications');
	dialog.setTitle(new GwtMessage().getMessage('Agenda items refreshed'));
    dialog.setPreference('refreshAgendaItems',  refreshAgendaItems.bind(this, dialog));
    dialog.setPreference('refreshAgendaItemsAndEmail',  refreshAgendaItemsAndEmail.bind(this, dialog));
	dialog.render();	
}

function refreshAgendaItems(dialog) {
	dialog.destroy();
	gsftSubmit(null, g_form.getFormElement(), 'sn_change_cab_refresh_ai');
}

function refreshAgendaItemsAndEmail(dialog) {
	dialog.destroy();
	gsftSubmit(null, g_form.getFormElement(), 'sn_change_cab_refresh_ai_and_email');
}
