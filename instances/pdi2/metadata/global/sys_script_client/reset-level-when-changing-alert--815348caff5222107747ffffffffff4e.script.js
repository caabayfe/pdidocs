function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading)
      return;

	// If new value for alert field is empty, clear out the level field as well, 
	// since the level field is dependent on the alert field
   if (newValue === ''){
		g_form.setValue('level', '');
		return;
   }
}
