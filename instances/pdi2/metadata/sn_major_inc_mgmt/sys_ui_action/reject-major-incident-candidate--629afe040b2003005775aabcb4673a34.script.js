function promptForRejectionReason() {
	//checking for work_notes visibility
	if(!g_form.getControl('work_notes')) {
		getMessage('Cannot reject major incident candidate as \'Worknotes\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}
	var dialog = new GlideModal('sn_major_inc_mgmt_mim_rejection_reason', false, 648, 250);
	getMessage('Reject Major Incident Candidate', function(msg) {
		dialog.setTitle(msg);
	});
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		dialog.template = glideModalTemplate;
		dialog.on('bodyrendered', function(event) {
			glideModalKeyDownHandler(event, dialog.getID());
		});
		dialog.render();
	});
	//This dialog will be destroyed in UI Page 'sn_major_inc_mgmt_mim_rejection_reason'
}

//Code that runs without promptForRejectionReason
if(typeof window == 'undefined')
	rejectMICOnConfirmation();

//Server-side code
function rejectMICOnConfirmation() {
	current.major_incident_state = new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.REJECTED;
	current.update();
	gs.addInfoMessage(gs.getMessage('Major incident candidate {0} has been rejected.', current.getDisplayValue()));
	action.setRedirectURL(current);
}
