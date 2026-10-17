function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var parsed = parseInt(newValue);
	if (isNaN(parsed) || parsed < 0 || parsed > 100){
		g_form.showFieldMsg('threshold', getMessage('Target Solution Coverage should be between 0 to 100'),"error", false);
	}
}
