function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var gr = new GlideRecord('ml_solution_parameters');
	if(gr.get(newValue)) {
		if (gr.getValue('requires_user_input') == 'true'){
			g_form.setReadOnly('user_inputs',false);
			g_form.setValue('user_inputs',gr.getValue('user_inputs'));
		} else {
			g_form.setValue('user_inputs','');
			g_form.setReadOnly('user_inputs', true);
		}
	}
}
