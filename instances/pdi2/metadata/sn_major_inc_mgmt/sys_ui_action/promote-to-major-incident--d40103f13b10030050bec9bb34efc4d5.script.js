function promptForPromoteMIC() {
    if (g_form.mandatoryCheck()) {
        if (!g_form.getControl('work_notes')) {
            getMessage('Cannot promote major incident candidate as "Worknotes" is not visible', function(msg) {
                g_form.addErrorMessage(msg);
            });
            return false;
        }

        var dialog = new GlideModal('sn_major_inc_mgmt_mim_workbench_promote', false, 848, 350);
        getMessage('Promote to Major Incident', function(msg) {
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
    }
}

if (typeof window == 'undefined')
	promoteMIC();

function promoteMIC() {
	var mim = new sn_major_inc_mgmt.MajorIncidentTriggerRules(current);
	mim.approveMIC();
	action.setRedirectURL(current);
}
