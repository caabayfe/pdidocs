function onSubmit() {
	var value = g_form.getValue("client_script");
	
	if (value.length > 0) {
		var re = new RegExp(/^(function|api.controller\s?=\s?function)\s?([$a-z_][$0-9a-z_]*)?\s?\(.*\)\s?\n?{/ig);
		var matches = re.exec(value);
		if (matches === null) {
			g_form.showFieldMsg("client_script", getMessage("Client controller must contain a JavaScript function, see default value for example"), "error");
			return false;
		}
	}
}
