function onCondition() {
	var fieldName = 'map_to_field';
	var widget = g_form.getControl(fieldName);
	if (widget) {
		widget.value = false;
		g_form.setValue('map_to_field', false);
		multiKeyDown(widget);
		g_form.setDisplay('map_to_field', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('record_producer_table', false);
		
	}
}
