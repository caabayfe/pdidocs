var formAlreadySubmitted = false;
var dialog = null;

function hideDialog() {
	dialog.destroy();
	dialog = null;
}

function submitForm() {
	formAlreadySubmitted = true;
	hideDialog();

	var actionName = g_form.getActionName();
	var actionElement = gel(actionName);
	if (actionElement) {
		gsftSubmit(actionElement);
	}
}

function onYes() {
	var au = new GlideAjax("AnnouncementUtil");
	au.addParam("sysparm_name", "deleteAnnouncementDismissals");
	au.addParam("sysparm_announcement_id", g_form.getUniqueValue());
	au.getXML(submitForm);
}

function onSubmit() {
	if(formAlreadySubmitted || !g_form.modified || g_form.isNewRecord()) {
		return true;
	}

	var prevDismissOption = g_form.getElement('sys_original.' + g_form.getElement('dismiss_options').id).value;

	if (prevDismissOption === 'not_dismissible' || prevDismissOption === 'session_dismissible') {
		return true;
	}

	// if the announcement is deactivated
	if (g_form.getBooleanValue('active') === false) {
		return true;
	}

	// if no one dismissed the announcement before
	var gr = new GlideRecord('m2m_dismissed_announcement');
	gr.addQuery('announcement', g_form.getUniqueValue());
	gr.query();
	if (!gr.hasNext()) {
		return true;
	}

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	dialog = new dialogClass('sp_yes_no_cancel_dialog');
	dialog.setTitle(new GwtMessage().getMessage('Would you like to reset the dismissed announcements?'));
	dialog.setPreference('message', new GwtMessage().format('You have made changes to an announcement that may have already been dismissed.  Would you like to re-display this message to users who have previously dismissed the announcement?'));
	dialog.setPreference('type', 'confirm');
	dialog.setPreference('onCancel', hideDialog);
	dialog.setPreference('onNo', submitForm);
	dialog.setPreference('onYes', onYes);

	dialog.render();

	return false;
}
