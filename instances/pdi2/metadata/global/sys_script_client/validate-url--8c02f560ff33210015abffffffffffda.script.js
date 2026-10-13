function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
   	EndPointValidation.validateUrl('url',newValue);
}
