function importSet() {
	if (WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery()) == null) 
		return WFStageSet.warnNoWorkflow('Must have a worklow to import stages.');
		
    var gDialog = new GlideDialogWindow('prompt_for_list_selection');
    gDialog.setTitle( getMessage("Select stage set") );
    gDialog.setPreference('choice_label',     getMessage("Stage set"));
    gDialog.setPreference('choice_script',   'WFStageSet');
    gDialog.setPreference('choice_function', 'getSetNames');
    gDialog.setPreference('onPromptComplete', stageSetSelected);
    gDialog.render();
    gDialog = null;
}

function stageSetSelected(setId, setName) {
	var workflowVersionId = WFStageSet.getWorkflowVersionFromQuery(g_list.getQuery());
    if (WFStageSet.importStages('StageSet', workflowVersionId, setId) == 'ok') 
		resetAndRefreshList();
	
	function resetAndRefreshList() {
		var list = GlideList2.get('wf_stage');
		list.refresh();
	}
}


function getMessage(msg) {  // hook for message caching.
   return msg;
}
