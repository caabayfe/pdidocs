function onLoad() {
	var stepsToPreventDotwalk = [
		'17a72288df60220062fe6c7a4df26397', // record update
		'14872288df60220062fe6c7a4df26319'  // record insert
	];

	var stepConfigId = g_form.getValue('step_config');
	var shouldPreventDotwalk = stepsToPreventDotwalk.indexOf(stepConfigId) > -1;
	if (!shouldPreventDotwalk)
		return;

	// this prevents dotwalking in templates
	filterExpanded = false;

	if (typeof createTemplateFilter !== "function")
		return;

	// createTemplateFilter builds a new template whenever the table input variable changes
	// it sets filterExpanded to true, so override it here and set it back to false
	var origCreateTemplateFilter = createTemplateFilter;
	createTemplateFilter = function(tname, fname, query, defVal) {
		origCreateTemplateFilter(tname, fname, query, defVal);
		filterExpanded = false;
	};

}
