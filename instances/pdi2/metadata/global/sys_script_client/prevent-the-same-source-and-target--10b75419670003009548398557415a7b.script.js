function onSubmit() {


    if (g_form.getValue("source_scope") == "" || g_form.getValue("target_scope") == ""){
		g_form.addErrorMessage(getMessage("Source Scope or Target Scope should not be empty."));
		return false;
	}

    if (g_form.getValue("source_scope") == g_form.getValue("target_scope")) {
	   g_form.addErrorMessage(getMessage("Source Scope and Target Scope should not have the same value."));
	   return false;
   }

	if (g_form.getValue("source") == "" && g_form.getValue("target") == "")
		return true;
	
	if (g_form.getValue("source") == g_form.getValue("target")) {
	   g_form.addErrorMessage(getMessage("Source and Target should not refer to the same record"));
	   return false;	
   }
}
