function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if(g_form.isNewRecord()) {
	  if(newValue == 'true') {
		  g_form.setValue('pagination_supported', false);
	  } else {
		  g_form.setValue('pagination_supported', true);
	  }
   }
}
