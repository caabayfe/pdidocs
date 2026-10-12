function onOkPTASK() {
	var view = g_form.getViewName();
	if(parent.name != "gsft_main" && (parent.$j.find("#" + view).length == 0)) {
		g_form.addErrorMessage(getMessage("Action not available here"));
		return;
	}

	if(g_form.mandatoryCheck()) {
		ScriptLoader.getScripts("ProblemModalUIHelpers.jsdbx", function() {
			ProblemModalUIHelpers.onOk("problem_task");
		});
	}
}
