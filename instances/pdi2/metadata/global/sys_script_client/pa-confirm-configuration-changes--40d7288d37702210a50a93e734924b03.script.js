var confirmDialogShown = false; 

function onSubmit() {
   if(g_form.isNewRecord()) return true;
   var currentAction = g_form.getActionName();
   if (currentAction !== 'sysverb_update' && currentAction !== 'sysverb_update_and_stay') return true;
    
    if (g_form.modified) {
       var trackFieldChangeList = ['report_source', 'facts_table', 'conditions'];
        
        if (isAnyFieldModified(trackFieldChangeList)) {
            if (confirmDialogShown) {
                return true; 
            }
			var prefix_message = getMessage("Changes to the configuration of this object will impact linked indicators, potentially making them unsupported for data snapshots. Please review the");
			var linkMessage = getMessage("limitations and requirements");
			var suffixMessage = getMessage("before proceeding.");
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
    }
    return true;
}

function isAnyFieldModified(trackFieldChangeList) {
    var modifiedFields = g_form.modifiedFields;
    for (var i = 0; i < trackFieldChangeList.length; i++) {
        if (modifiedFields.hasOwnProperty('pa_cubes.' + trackFieldChangeList[i]) && modifiedFields['pa_cubes.' + trackFieldChangeList[i]]) {
            return true;
        }
    }
    return false;
}
