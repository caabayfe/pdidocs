function onChange(control, oldValue, newValue) {
   if (newValue == '') {
      showHideElement('repeat_count', false, false);
      showHideElement('days_of_week', false, false);
      showHideElement('monthly_type', false, false);
      showHideElement('repeat_until', false, false);
	  g_form.setValue('repeat_until', '');
	  g_form.setValue('repeat_count', '1');
   } else {
      showHideElement('repeat_count', true, true);
      showHideElement('repeat_until', true, false);
   }

   if ((newValue == 'daily') || (newValue == 'yearly')) {
      showHideElement('days_of_week', false, false);
      showHideElement('monthly_type', false, false);

   } else if ((newValue == 'weekly') || (newValue == 'specific')) {
      showHideElement('days_of_week', true, true);
      showHideElement('monthly_type', false, false);

   } else if (newValue == 'monthly') {
      showHideElement('days_of_week', false, false);
      showHideElement('monthly_type', true, true);   
   
   } else if ((newValue == 'weekdays') || (newValue == 'weekends')
         || (newValue == 'weekMWF') || (newValue == 'weekTT')) {
            
      showHideElement('repeat_count', false, false);
      showHideElement('days_of_week', false, false);
      showHideElement('monthly_type', false, false);
      g_form.setValue('repeat_count', '1');
   }   
   setRepeatText();
}
