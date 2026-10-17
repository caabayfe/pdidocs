function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	g_form.hideFieldMsg('end_point');
	if (newValue != 2) {
		g_form.showFieldMsg('end_point', getMessage('External domain urls should not be configured as "inline" or "modal" as they might not be viewable due to security restrictions. Please choose option "new window" for such end points.'));
	}
}
