function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }
	
	g_form.clearValue('dynamic_value_field');
	g_form.clearValue('dynamic_value_dot_walk_path');
}
