function onAssess() {
	if (g_form && g_form.mandatoryCheck()) {
		ScriptLoader.getScripts("ProblemModalUIHelpers.jsdbx", function() {
			ProblemModalUIHelpers.onAssess();
		});
	}
}
