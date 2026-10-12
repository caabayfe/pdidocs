function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if (g_form.getValue('search_engine') === 'ai_search') {
		g_form.setValue('genius_results_limit', 1);
		g_form.setValue('hit_highlighting', true);
		g_form.setValue('spell_check', true);
	} else {
		g_form.clearValue('genius_results_limit');
		g_form.clearValue('hit_highlighting');
		g_form.clearValue('spell_check'); 
		g_form.clearValue('search_profile');
	}
   
}
