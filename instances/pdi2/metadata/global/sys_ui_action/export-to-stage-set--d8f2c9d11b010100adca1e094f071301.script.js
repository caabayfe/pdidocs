function promptForSetName() {
	if (WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery()) == null) 
		return WFStageSet.warnNoWorkflow('Must have a worklow to export stages.');
	 	
    var gDialog = new GlideDialogWindow('prompt_for_input', false, 320);
	gDialog.setTitle(new GwtMessage().getMessage('Enter name for new Stage Set'));
    gDialog.setPreference('prompt', "{ text:'Set Name', value:'enter-name' }");
    gDialog.setPreference('onPromptComplete', exportStageSet);
	gDialog.render();
}

function exportStageSet(setName) {
    var workflowVersionId = WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery());
    var ret = WFStageSet.exportStageSet(setName, workflowVersionId, g_list.getQuery());
	return ret;
}
