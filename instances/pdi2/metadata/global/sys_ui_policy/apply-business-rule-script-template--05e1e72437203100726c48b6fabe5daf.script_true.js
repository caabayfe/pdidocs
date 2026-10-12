function onCondition() {
	if(!g_scratchpad.execute_function || g_scratchpad.execute_function == "false")
      return;
	
	var when = g_form.getValue('when');
	var script = g_form.getValue('script');
	var collection = g_form.getValue("collection");

	//the templates and isDefaultTemplate are loaded globally in an onLoad client script  
	var isMine = isDefaultTemplate(script);
	if (!isMine)
		return;
	
	if (when.indexOf('before') > -1)
		script = template_onBefore;
	if (when.indexOf('after') > -1)
		script = template_onAfter;
	if (when.indexOf('async') > -1)
		script = template_onAsync;
	if (when.indexOf('display') > -1)
		script = template_onDisplay;
	
	if (collection == "global" && g_form.isNewRecord()) {
		script = "";
	}
	
	g_form.setValue('script', script);
}
