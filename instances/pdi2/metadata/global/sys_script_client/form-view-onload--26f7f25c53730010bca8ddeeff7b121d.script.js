function onLoad() {
	if (!g_form.isNewRecord())
		g_form.setReadOnly('dictionary', true);
	var dictionary = g_form.getReference('dictionary');
	if (!dictionary)
		return;
	var derived = dictionary.getValue('derived');
	var type = dictionary.getValue('type');
	var x = new GwtMessage();
	switch (type) {
		case 'SYNONYM':
			g_form.setDisplay('payload', true);
			g_form.setMandatory('payload', true);
			g_form.hideAllFieldMsgs();
			g_form.showFieldMsg('payload', x.getMessage('list of terms in json format, e.g. ["term1","term2"]'), 'info', true);
			break;
		case 'STOPWORD':
			g_form.setMandatory('payload', false);
			g_form.setDisplay('payload', false);
			break;
		case 'SPELLCHECK':
			g_form.addInfoMessage(x.getMessage('For derived dictionary, active terms will be blocked'));
			g_form.setMandatory('payload', false);
			g_form.setDisplay('payload', false);
			break;
		case 'AUTOCOMPLETE':
			if (derived == 'true') {
				g_form.addInfoMessage(x.getMessage('For derived dictionary, active terms will be blocked'));
				g_form.setMandatory('payload', false);
				g_form.setDisplay('payload', false);
			} else {
				g_form.setMandatory('payload', false);
				g_form.setDisplay('payload', true);
				g_form.hideAllFieldMsgs();
				g_form.showFieldMsg('payload', x.getMessage('map of key-value pair in json format, e.g. {"key1":"value1","key2":"value2"}'), 'info', true);
			}
			break;
	}
}
