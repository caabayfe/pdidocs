function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if(g_form.getValue('training_frequency') == "run_once" && g_form.hasField('update_frequency') ){
	   g_form.setValue('update_frequency','do_not_update');
   }
   
}
