function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	g_form.setMandatory('work_notes', (newValue != 'true'));
   
}
