function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	var isDynamic = g_form.getValue("use_dynamic_default");
	if( isDynamic == undefined || isDynamic == "true")
		return;
	else if(isDynamic == "false"){
			g_form.setValue('default_value', "");
			return;
	}
	
}
