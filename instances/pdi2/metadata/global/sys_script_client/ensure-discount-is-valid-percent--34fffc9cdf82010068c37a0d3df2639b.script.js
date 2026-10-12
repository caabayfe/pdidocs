function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
	if (g_form.getValue('contract_model') != '3c967c55dfa1010068c37a0d3df26350')
		return;
	var intValue = parseInt(newValue);
	if ((intValue < 0) || (intValue > 99))
		g_form.showFieldMsg("discount", "The discount must be between 0 and 99%", "info", true);
}
