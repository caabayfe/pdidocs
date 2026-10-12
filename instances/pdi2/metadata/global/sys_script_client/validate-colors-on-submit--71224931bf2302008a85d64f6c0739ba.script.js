function isColor(color) {
	return /^#[0-9A-F]{6}$/i.test(color);
}

function onSubmit() {
	g_form.clearMessages();
	var all_valid = true;
	var colors = ['color_1', 'color_2', 'color_3', 'color_4', 'end_color'];
	for (var i=0; i < 5; i++) {
		var color = $('pa_target_color_schemes.range_' + colors[i] + '.color').value;
		if (color != '' && !isColor(color)) {
			var errorMsg = formatMessage(getMessage('Range color {0} is invalid. It should be a hexadecimal value with the format #HHHHHH'), i + 1);
			g_form.addErrorMessage(errorMsg);
			all_valid = false;
		}
	}
	return all_valid;
}
