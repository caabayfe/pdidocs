function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   } else if (newValue === 'true') {
	   g_form.showFieldMsg('use_fields_for_ref_lookup', 'Configure table and field values for reference lookup.', 'info');
   } else {
	   g_form.hideFieldMsg('use_fields_for_ref_lookup')
   }
}
