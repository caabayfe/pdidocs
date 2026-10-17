function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var parsed = parseInt(newValue);
	if (isNaN(parsed) || (parsed < 2)){
		g_form.showFieldMsg('min_records', getMessage('Minimum number of records in a cluster should be an integer greater than or equal to 2'),"error", false);
	}
}
