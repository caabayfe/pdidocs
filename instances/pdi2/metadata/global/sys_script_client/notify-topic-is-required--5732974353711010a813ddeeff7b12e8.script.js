function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue === 'greeting' || newValue === 'explore_help' || newValue === 'error' || newValue === 'fallback') {
		g_form.showFieldMsg('topic', getMessage('Name is required for this topic type'), 'info');
	} else {
		g_form.hideFieldMsg('topic');
	}

}
