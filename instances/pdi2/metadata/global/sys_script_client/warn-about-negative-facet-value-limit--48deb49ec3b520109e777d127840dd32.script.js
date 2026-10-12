function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if (newValue < 0) {
       g_form.showFieldMsg('option_limit', getMessage('Facet Value Limit must be set to a non-negative number'), 'error');
   } else if (oldValue < 0) {
      // They changed the negative value to a non-negative one, so remove the message
       g_form.hideFieldMsg('option_limit');
    }
}
