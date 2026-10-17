function onChange(control, oldValue, newValue, isLoading, isTemplate) {

   if(newValue == 'sys_tags'){
	   g_form.showFieldMsg("field", "Lists do not support highlighted values on tag field types", "info");
   }
   
}
