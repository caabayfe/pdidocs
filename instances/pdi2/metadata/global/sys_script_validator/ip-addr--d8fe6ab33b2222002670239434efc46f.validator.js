function validate(value) {
	if (!value)
		return true;

	if (typeof g_scratchpad === 'undefined') {
		// If g_scratchpad is undefined, assume we should be doing strict validation of IPs
		var ajax = new GlideAjax('IPAddressValidator');
		ajax.addParam('sysparm_name', 'validateStrict');
		ajax.addParam('ip_value', value);
		ajax.getXMLWait();
		var answer = ajax.getAnswer();
		if (answer === "true")
			return true;

		return new GwtMessage().getMessage("{0} is an invalid IP Address", value);
	} else {
		if (!g_scratchpad['ip_address_validation'] || g_scratchpad['ip_address_validation'].length == 0) {
			var tableName = g_form.getTableName();
			var fields = [];
			var values = [];
			for (var i = 0; i < g_form['elements'].length; i++) {
				var element = g_form['elements'][i];
				if (element['type'] == 'ip_addr') {
					fields.push(element['fieldName']);
					values.push(g_form.getValue(element['fieldName']));
				}
			}
			var ajax = new GlideAjax('IPAddressValidator');
			ajax.addParam('sysparm_name', 'validateDesktop');
			ajax.addParam('table', tableName);
			ajax.addParam('fields', fields);
			ajax.addParam('values', values);
			ajax.getXMLWait();
			g_scratchpad['ip_address_validation'] = JSON.parse(ajax.getAnswer());
		}
		var isValid = g_scratchpad['ip_address_validation'][0];
		g_scratchpad['ip_address_validation'].shift();
		if (isValid)
			return true;

		return new GwtMessage().getMessage("{0} is an invalid IP Address", value);
	}
}
