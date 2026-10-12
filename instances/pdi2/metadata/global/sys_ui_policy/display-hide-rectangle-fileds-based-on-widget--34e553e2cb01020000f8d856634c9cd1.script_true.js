function onCondition() {
	var widget_id = g_form.getValue('sp_widget');
	if (!widget_id) return;

	var rec = new GlideRecord('sp_widget');
	rec.addQuery('sys_id', widget_id);
	rec.query(recResponse);
}

function recResponse(widget) {
	if (widget.next()) {
		var fields = widget.getValue('field_list');

		var fields_array = fields.split(',');
		if (fields)
			hideAllFields();
		else
			return;

		// Show Widget fields
		for (var i in fields_array) {
			if (fields_array.hasOwnProperty(i)) {
				var field = fields_array[i];
				g_form.setDisplay(field, true);
			}
		}
	}
}

function hideAllFields() {
	var never_hide = ['sp_widget', 'sp_column', 'sys_class_name', 'title', 'css'];

	// Hide ALL fields except in 'never_hide'
	for (var i in g_form.elements) {
		if (g_form.elements.hasOwnProperty(i)) {
			var field = g_form.elements[i];
			if (never_hide.indexOf(field.fieldName)==-1)
				g_form.setDisplay(field.fieldName, false);
		}
	}
}
