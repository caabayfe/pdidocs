var confirmDialogShown = false;

function onSubmit() {
    if(g_form.isNewRecord()) return true;
    var currentAction = g_form.getActionName();
    if (currentAction !== 'sysverb_update' && currentAction !== 'sysverb_update_and_stay') return true;

    if (g_form.modified) {
        // do not show modal for DS disabled Indicators
        if (confirmDialogShown || g_scratchpad.isMlbEnabled != 1) {
            return true;
        }

		var prefix_message = getMessage("You are about to make changes to an indicator that is data snapshots enabled. These changes may disable data snapshots. Please review the");
		var linkMessage = getMessage("limitations and requirements");
		var suffixMessage = getMessage("for data snapshots before proceeding.");
		var link = getMessage("https://www.servicenow.com/docs/bundle/yokohama-now-intelligence/page/use/performance-analytics/reference/limitations-mlb.html/");
		confirmDialogShown = true;
		var dialog = new GlideModal('pa_mlb_check_ui_modal', true);
		dialog.setTitle(getMessage('Are you sure?'));
		dialog.setPreference('sysparm_prefixMessage', prefix_message);
		dialog.setPreference('sysparm_linkMessage', linkMessage);
		dialog.setPreference('sysparm_link', link);
		dialog.setPreference('sysparm_suffixMessage', suffixMessage);
		dialog.setPreference('sysparm_warning', 'true');
		dialog.setPreference('onPromptComplete', function() {
			confirmDialogShown = true;
			gsftSubmit(null, g_form.getFormElement(), currentAction);
		});
		dialog.setPreference('onPromptCancel', function() {
			confirmDialogShown = false;
		});
        dialog.render();

        return false;
    }

    // Allow submission if no modifications
    return true;
}
