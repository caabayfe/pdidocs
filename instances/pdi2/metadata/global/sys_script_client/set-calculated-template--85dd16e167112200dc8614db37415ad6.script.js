function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }
	var template_calculatedField = "(function calculatedFieldValue(current) {\r\n\r\n	// Add your code here\r\n	return '';  // return the calculated value\r\n\r\n})(current);";	
   //Type appropriate comment here, and begin script below
	var script = g_form.getValue("calculation");
	if(newValue.toString() === "false" || script.trim().length != 0 )
      return;
	//Set calculation field to the template loaded in onLoad client script
	g_form.setValue("calculation", template_calculatedField);
   
}
