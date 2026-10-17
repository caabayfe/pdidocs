function importChoices() {
	if (WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery()) == null) 
		return WFStageSet.warnNoWorkflow('Must have a workflow to export stages.');
	 
    var msgs = new GwtMessage();
    var dialog = new GlideDialogWindow('glide_confirm_standard');
    dialog.setTitle(msgs.getMessage('Import Stages from Choice List'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', msgs.getMessage('Are you sure you want to import the choice list values as stages?'));
    dialog.setPreference('onPromptComplete', importChoiceList);
    dialog.render();
}

function importChoiceList() {
    var workflowVersionId = WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery());
    if (WFStageSet.importStages('ChoiceList', workflowVersionId) == 'ok') 
        resetAndRefreshList();
	
	function resetAndRefreshList() {
		var list = GlideList2.get('wf_stage');
		list.refresh();
	}
}
