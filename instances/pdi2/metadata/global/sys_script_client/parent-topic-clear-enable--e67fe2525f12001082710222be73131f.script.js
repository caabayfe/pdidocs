function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   // prevent clearing parent topic field while the topic is being moved to another taxonomy
   if (g_scratchpad.formSubmissionInProgress)
      return;

   if(!isLoading)
		g_form.clearValue('parent_topic');
	
   if (newValue === '') {
      g_form.setReadOnly('parent_topic', true);
      return;
   }
	
   g_form.setReadOnly('parent_topic', false);
}
