function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	g_form.getReference('column_on_table', setColumnType);
   
}

function setColumnType(gr) {
	var field_class = new GlideRecord('sys_glide_object');
	field_class.addQuery('name', gr.internal_type);
	field_class.query();
	if (field_class.next()) {
		var column_type = g_form.getControl('column_type');
		if (column_type)
			g_form.setValue('column_type', field_class.sys_id);
	}
}
