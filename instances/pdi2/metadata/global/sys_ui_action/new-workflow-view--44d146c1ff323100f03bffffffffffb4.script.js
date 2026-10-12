function loadView(viewName) {
	if (!top.workflowDiagram || !top.workflowDiagram.dialog) {
		g_form.addInfoMessage("Diagram dialog not found");
		return;
	}
	
	top.workflowDiagram.dialog.switchView(viewName);
}
