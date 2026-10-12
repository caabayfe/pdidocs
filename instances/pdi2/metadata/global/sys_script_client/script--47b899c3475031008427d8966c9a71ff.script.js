function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
   var type = g_form.getValue("type");
   var referenceQual = g_form.getValue("reference_qual");
   if (type == "8") {
   	if (referenceQual != "")
   		return;
   	else 
   		g_form.setValue("use_reference_qualifier", "simple");
   }
   if (type == "22" || type == "18" || type == "21") {
   		g_form.setValue("use_reference_qualifier", "advanced");
   }
   
}
