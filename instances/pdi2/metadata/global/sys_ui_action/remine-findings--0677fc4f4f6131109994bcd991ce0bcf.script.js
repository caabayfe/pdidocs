function generateMissingFindings() {
    var map = getMessages(["Are you sure?", "Do you want to schedule mining job for findings?", "Scheduled Interactive job for findings mining"]);
    var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('glide_confirm_basic');
    dialog.setTitle(map["Are you sure?"]);
    dialog.setPreference('title', map["Do you want to schedule mining job for findings?"] + "<br/><br/>");
    dialog.setPreference('onPromptComplete', onPromptCompleteForScheduleFindingsMining);
    dialog.render();
}

function onPromptCompleteForScheduleFindingsMining() {
    gsftSubmit(null, g_form.getFormElement(), 'remine_findings');
}
if (typeof window == 'undefined') {
    executeScheduleFindingsMining();
}

function executeScheduleFindingsMining() {
    try {

        SNC.ProcessOptimization.scheduleFindingsMining({
            'projectId': current.getUniqueValue()
        });
    } catch (error) {
        gs.addErrorMessage(error.getMessage());
    }
    action.setRedirectURL(current);
}
