function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if (newValue < 0) {
       g_form.showFieldMsg('suggestions_to_show_limit', getMessage('Suggestion Limit must be set to a non-negative number'), 'error');
   } else if (oldValue < 0) {
      // They changed the negative value to a non-negative one, so remove the message
       g_form.hideFieldMsg('suggestions_to_show_limit');
    }
}
