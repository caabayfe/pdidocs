function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	var inputType = g_form.getValue("input_type"); 
	var tableName = g_form.getValue("table_name");
	if((inputType != "list" && inputType != "search_list") || tableName == "")
		return;
	
	var ga = new GlideAjax('UIParameterListFieldNamesProvider') ;
	ga.addParam('sysparm_name','getAllowedFieldNames');
	ga.addParam('table_name', tableName);
	ga.addParam('list_type', inputType);
	ga.getXML(callback);

	function callback(response) {
		var prevValue = g_form.getValue("field_name");
		g_form.clearOptions("field_name");
		var result = response.responseXML.getElementsByTagName("result");
		g_form.clearOptions("field_name");
		for(var i = 0; i < result.length; i++){
			var name = result[i].getAttribute("name");
			var label = result[i].getAttribute("label");
			g_form.addOption("field_name", name, label);
		}

		if(prevValue && g_form.getOption("field_name", prevValue))
			g_form.setValue("field_name", prevValue);
	}
}
