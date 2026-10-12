function onLoad() {
	var gURL = new GlideURL();
	gURL.setFromCurrent();
	var dialogAction = gURL.getParam("sysparm_dialog_action");
	
	if (!dialogAction)
		return;
	
	var showDialog = null;
	switch(dialogAction) {
		case "add_a_question":
			showDialog = new sc_ic_showQuestionDialog("-1");
			break;
		case "add_a_task_defn":
			showDialog = new sc_ic_showTaskDefnDialog("-1");
			break;
		case "add_an_approval":
			showDialog = new sc_ic_showApprovalDialog("-1");
			break;
		case "add_a_section":
			showDialog = new sc_ic_showSectionDialog("-1");
			break;
		default:
			null;
	}
	
	if (showDialog != null) {
		showDialog.display("saveForm");
	}
}
