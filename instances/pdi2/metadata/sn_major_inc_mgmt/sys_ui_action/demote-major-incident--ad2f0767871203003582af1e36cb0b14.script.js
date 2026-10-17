function promptForDemoteReason() {
	//checking for work_notes visibility
	if(!g_form.getControl('work_notes')) {
		getMessage('Cannot demote major incident as \'Work notes\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}
	var dialog = new GlideModal("sn_major_inc_mgmt_mim_demote_reason", false, 648, 250);
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		dialog.template = glideModalTemplate;
		dialog.on('bodyrendered', function(event) {
			glideModalKeyDownHandler(event, dialog.getID());
		});
		dialog.render();
		getMessage('Demote Major Incident', function(msg) {
			dialog.setTitle(msg);
			dialog.updateTitle();
		});
	});
	//This dialog will be destroyed in ui page 'sn_major_inc_mgmt_mim_cancel_reason'
}

//code that runs when gsftsubmit is done on this ui action
if (typeof window == 'undefined')
	demoteMIOnConfirmation();

function demoteMIOnConfirmation() {
	current.major_incident_state = new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.CANCELED;
	current.update();
	gs.addInfoMessage(gs.getMessage('{0} is no longer a major incident', current.getDisplayValue()));
	action.setRedirectURL(current);
}
