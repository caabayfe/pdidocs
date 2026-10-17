updateFormatter();
function updateFormatter() {
	var formatterGR = new GlideRecord("sys_ui_formatter");
	if (!formatterGR.get("f6764f93efa002008e4c36caa5c0fb67"))
		return;
	formatterGR.setValue("formatter", "change_conflict_worker_progress_gate.xml");
	formatterGR.update();

	var uiElementGR = new GlideRecord("sys_ui_element");
	uiElementGR.addQuery("element", "change_request_conflict_progress.xml");
	uiElementGR.query();
	uiElementGR.setValue("element", "change_conflict_worker_progress_gate.xml");
	uiElementGR.updateMultiple();
}
