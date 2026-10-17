function onLoad() {
	if (!g_form.getValue('target_table')) return;
	injectAllFieldsOption();
}

function injectAllFieldsOption() {
	var attempts = 0;
	// value_field options populate asynchronously after target_table change or form load; poll until ready
	var interval = setInterval(function() {
		if (++attempts > 30) {
			clearInterval(interval);
			return;
		}
		var el = g_form.getControl('value_field');
		if (el && el.options && el.options.length > 1) {
			clearInterval(interval);
			for (var i = 0; i < el.options.length; i++) {
				if (el.options[i].value === '*') return;
			}
			g_form.addOption('value_field', '*', '* (All fields)', 0);
		}
	}, 150);
}
