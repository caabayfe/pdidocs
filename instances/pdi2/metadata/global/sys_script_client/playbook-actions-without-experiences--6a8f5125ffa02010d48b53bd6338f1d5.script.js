function onLoad() {
	if(g_form.isNewRecord())
		return;
	
	var playbookModel = '16f2aef6c32110109b1204186e40dd7f';
	var playbookStageModel = '61cd5e20c30210109b1204186e40ddb0';
	var playbookActivityModel = 'ca57d12e730333004a905ee515f6a7b2';
	var actionModel = g_form.getValue('model');
	if(![playbookModel, playbookStageModel, playbookActivityModel].includes(actionModel) || g_scratchpad.containsPlaybooks)
		return;
	
	g_form.addInfoMessage(getMessage("Playbook DA missing mapping"));
   
}
