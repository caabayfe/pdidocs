function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var gr = new GlideRecord('ml_solution_parameters');
	if(gr.get(newValue)) {
		if (gr.getValue('requires_user_input') == 'true'){
			g_form.setReadOnly('user_inputs',false);
		} else {
			g_form.setReadOnly('user_inputs', true);
		}
	}
}
