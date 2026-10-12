function onSubmit() {
	
// Get the status and reload the page only when 'Cancel training job' or 'Refresh training status' UI actions are clicked
var actionName = g_form.getActionName();
if (actionName === 'refresh_training_status' || actionName === 'cancel_training_job') {

	var ga = new GlideAjax('AutoResolutionMLAjax');
	ga.addParam('sysparm_name', 'areTrainingsCompleted');
	ga.addParam('sysparm_sysId', g_form.getUniqueValue());
    
	ga.getXMLWait();
	var trainingCompleted = ga.getAnswer() === 'true';
	
	if (trainingCompleted)
		location.reload();
	
}
	
}
