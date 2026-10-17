function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
  var conditionType = g_form.getValue('condition_type');
	if(conditionType != "script")
		return;
	
	var queryScriptTemplate = "(function getQueryString(input) {\r\n    //Type appropriate comment here, and begin script below\r\n var queryString = '';\r\n return queryString; \r\n })(input);";
	
	var queryConditionScript = g_form.getValue("query_condition_script");
	
	var isMine = false;
	if (queryConditionScript == '')
		isMine = true;
	if (queryConditionScript == queryScriptTemplate.replace(/\r/g, ""))
		isMine = true;
	
	if (!isMine)
		return;	
	
	g_form.setValue('query_condition_script', queryScriptTemplate);
   
}
