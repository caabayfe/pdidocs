function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if(newValue == "PA")		
		g_form.setValue("use_last_point",true);

}
