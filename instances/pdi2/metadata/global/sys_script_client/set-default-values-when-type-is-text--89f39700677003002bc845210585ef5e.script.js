function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue == 'text') {
		g_form.setValue('visualization', 'word_cloud');
		g_form.hideRelatedLists();
		g_form.setValue('cutoff', 1);
		g_form.setValue('limit', 50);
		g_form.setValue('words_in_trendline', 5);
	}
}
