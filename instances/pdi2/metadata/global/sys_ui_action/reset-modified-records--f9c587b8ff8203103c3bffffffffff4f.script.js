var cancelReset = function() {};

var doReset = function() {
	gsftSubmit(null, g_form.getFormElement(), 'atf_reset_modified_records');
};

function resetModifiedRecordsDialog() {
	var dialog = new GlideModal('glide_modal_confirm', true, 400);
	dialog.setTitle(getMessage("Reset modified records"));
	dialog.setPreference("body", getMessage("This will clear all modified records tracked for this test. After resetting, run the test again to triage the issue."));
	dialog.setPreference("buttonLabelCancel", getMessage("Cancel"));
	dialog.setPreference("buttonLabelComplete", getMessage("Reset"));
	dialog.setPreference('onPromptCancel', cancelReset.bind(this));
	dialog.setPreference('onPromptComplete', doReset.bind(this));
	dialog.render();
}

if (typeof window == 'undefined')
	resetModifiedRecords();

function resetModifiedRecords() {
	new sn_atf.UserTestProcessor().resetModifiedRecords(current);
	gs.addInfoMessage(gs.getMessage("Modified records reset"));
	action.setRedirectURL(current);
}
