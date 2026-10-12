function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var originalValue = g_form.getValue("end_date");
   if (isLoading || newValue === '' || originalValue === '') {
      return;
   }
	
	var newDate = new Date(getDateFromFormat(newValue, g_user_date_format));
	var originalDate = new Date(getDateFromFormat(originalValue, g_user_date_format));
	if (newDate > originalDate) {
		g_form.setValue("end_date", newValue);
		g_form.showFieldMsg('end_date', "The selected Date (" + originalValue +") was before the selected Start Date. End Date has been reset to the Start Date ", 'warning');
	}
}
