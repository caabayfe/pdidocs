function promptForProposalReason() {
    if (g_form.mandatoryCheck()) {
        //checking for work_notes visibility
        if (!g_form.getControl('work_notes')) {
            getMessage('Cannot propose major incident as "Worknotes" is not visible', function(msg) {
                g_form.addErrorMessage(msg);
            });
            return false;
        }
        var dialog = new GlideModal('sn_major_inc_mgmt_mim_propose', false, 651, 250);
        getMessage('Propose Major Incident', function(msg) {
            dialog.setTitle(msg);
        });
        ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
            dialog.template = glideModalTemplate;
            dialog.on('bodyrendered', function(event) {
                glideModalKeyDownHandler(event, dialog.getID());
            });
            dialog.setPreference('WORK_NOTES', g_form.getValue('work_notes'));
            dialog.setPreference('BUSINESS_IMPACT', g_form.getValue('business_impact'));
            dialog.setPreference("focusTrap", true);
            dialog.render();
        });
        //This dialog will be destroyed in UI Page 'sn_major_inc_mgmt_mim_propose'
    }
}


if(typeof window == 'undefined')
	proposeMICOnConfirmation();

//Server-side code
function proposeMICOnConfirmation() {
	current.major_incident_state = new sn_major_inc_mgmt.MajorIncidentTriggerRules().MAJOR_INCIDENT_STATE.PROPOSED;
	current.update();
	gs.addInfoMessage(gs.getMessage('{0} has been proposed as a major incident candidate', current.getDisplayValue()));
	action.setRedirectURL(current);
}
