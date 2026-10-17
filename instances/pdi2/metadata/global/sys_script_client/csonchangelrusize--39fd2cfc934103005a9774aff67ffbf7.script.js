function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if (newValue <= 12) {
	   g_form.addErrorMessage(getMessage("LRU size must be greater than 12"));
	   return;
   }
   //Type appropriate comment here, and begin script below
   
}
