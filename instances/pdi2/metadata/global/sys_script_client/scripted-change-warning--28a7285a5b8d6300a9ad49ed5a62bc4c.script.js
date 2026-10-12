function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	if (newValue != "false")
		return;

	var script = g_form.getValue('data_fetch_script');
	if (script == "")
		return;

	// if this scriptTemplate variable is changed, the same variable in the Set Default Script client script must be changed to match
	var scriptTemplate = "(function(query) {\r\n  var results = [];\r\n  /* Calculate your results here. */\r\n  \r\n  return results;\r\n})(query);";
	if (script == scriptTemplate.replace(/\r/g, ""))
		return;
	
	g_form.showFieldMsg("is_scripted_source", getMessage("Unchecking this field means the data fetch script will no longer run, which may lead to unexpected results"), "error");
}
