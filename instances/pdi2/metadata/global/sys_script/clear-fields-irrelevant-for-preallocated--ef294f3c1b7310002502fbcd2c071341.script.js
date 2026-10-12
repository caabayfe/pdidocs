var fields = current.getFields();
for ( var i = 0; i < fields.length; i++) {
	var field = fields[i];
	var name = field.getName();
	if (name != 'quantity' && name != 'model' && name != 'model_category' &&
			name != 'install_status' && name != 'substatus' &&
			name != 'stockroom' && name != 'location' && name != 'asset_tag' &&
			name != 'serial_number' && name != 'parent' &&
			name != 'comments' && name != 'assigned_to' && name != 'company') {
		// only the fiels listed in the if condition are relevant to
		// pre-allocated
		field.setValue('');
	}
}
