function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }
	
   if (
		newValue === '' ||
		newValue !== 'c3547169534723003eddddeeff7b126c' ||
		newValue !== 'd91731a9534723003eddddeeff7b121c'
   ) {
		g_form.setValue('group_by', false);
		g_form.setValue('group', '');
   }
}
