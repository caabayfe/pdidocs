function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var colorHelper = new ActionLayoutItemColorHelper();
	colorHelper.loadVariantOptions(newValue); 
}
