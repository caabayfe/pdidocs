/* global assetSetDomainParameters */
function openModal() {
	var maxCount = g_scratchpad.sn_itam_bulk_update_max_tol;
	var maxExceededMsg = '';
	getMessage('More than {0} lines are selected; the bulk update is limited to {0} lines.', function(translatedMsg) {
		maxExceededMsg = new GwtMessage().format(translatedMsg, maxCount);
	});
	var sysId = g_form.getUniqueValue();
	var DialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gm = new DialogClass('alm_bulk_update_tol_tasks');
	// Sets the dialog title
	gm.setTitle(getMessage('Bulk Update - Transfer Order Lines'));
	gm.setPreference('sysId', sysId);
	gm.setPreference('maxCount', maxCount);
	gm.setPreference('maxExceededMsg', maxExceededMsg);
	// to pass domain params
	assetSetDomainParameters(gm);
	gm.setWidth(550);
	// Opens the dialog
	gm.render();
}
