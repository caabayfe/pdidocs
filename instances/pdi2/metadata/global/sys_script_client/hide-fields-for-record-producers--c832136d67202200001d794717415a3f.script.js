function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var appliesTo = g_form.getValue('applies_to');
	var catItem = g_form.getValue('cat_item');
	if (appliesTo == 'item' && catItem ) {
		var gr = new GlideRecord('sc_cat_item_producer');
		if(gr.get(catItem)) {
			g_form.setDisplay('applies_sc_task', false);
			g_form.setDisplay('applies_req_item', false);
			return;
		}
	}
	g_form.setDisplay('applies_sc_task', true);
	g_form.setDisplay('applies_req_item', true);
	g_form.setDisplay('applies_target_record', false);
}
