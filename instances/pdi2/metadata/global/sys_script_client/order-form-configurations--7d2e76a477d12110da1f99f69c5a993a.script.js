function onLoad() {
	// State values: 1 - Requested, 2 - Order Confirmed, 3 - Shipped, 4 - Delivered, 5 - Cancelled
	var fieldsToBeSetReadOnly = ['model', 'number', 'company', 'name', 'email', 'mobile', 'street', 'city', 'state_loc', 'country', 'zip', 'return_name', 'return_street', 'return_city', 'return_state_loc', 'return_country', 'return_zip'];
	var state = g_form.getValue('state');
	if (state === '3' || state === '4') {
		fieldsToBeSetReadOnly.push('tracking_number', 'carrier', 'return_tracking_number', 'return_carrier', 'asset_tag', 'serial_number');
	}
	for (var i = 0; i < fieldsToBeSetReadOnly.length; i++) {
		g_form.setReadOnly(fieldsToBeSetReadOnly[i], true);
	}
}
