function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
		g_form.clearValue('pa_datasnapshot_indicator.calendar_freq');
		g_form.clearValue('pa_datasnapshot_indicator.calendar');
   
}
