function isColor(color) {
	return /^#[0-9A-F]{6}$/i.test(color);
}

function onSubmit() {
	g_form.clearMessages();
	var all_valid = true;
	for (var i=1; i <= 32; i++) {
		var color = $('pa_chart_color_schemes.color_' + i + '.color').value;
		if (color != '' && !isColor(color)) {
			var errorMsg = formatMessage(getMessage('Color {0} is invalid. It should be a hexadecimal value with the format #HHHHHH'), i);
			g_form.addErrorMessage(errorMsg);
			all_valid = false;
		}
	}
	return all_valid;
}
