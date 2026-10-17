function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
	EndPointValidation.validateHost('host_name',newValue);
}
