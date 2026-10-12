function actionOK() {
	if (typeof(parent.wfDiagram) != 'undefined')
		parent.wfDiagram.loadWorkflowOnValidationComplete('$[sysparm_sys_id]');

	closeDialogForm('validate_workflow');
}
