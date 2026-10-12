function onSubmit() {
	
	if (g_form.getBooleanValue("send_expiration_reminder") && g_form.getIntValue("pwd_validity_days") <= g_form.getIntValue("expiration_warn_days")) {
		g_form.showFieldMsg('pwd_validity_days', new GwtMessage().getMessage("The 'Days password is valid' must be greater than the 'Days prior to start reminders'"), 'error');
		return false;
	}
	
	var redirectUrl = g_form.getValue('redirect_url');
	if (redirectUrl) {
		if (!isValidUrl(redirectUrl)) {
			g_form.showFieldMsg('redirect_url', new GwtMessage().getMessage("Invalid URL. Enter the complete URL. If the path is under the same domain, start the path with the {0} character.",'\'/\''), 'error');
			return false;
		}
	}
	
	// Identification type should not be more than two
    var idenTypes = g_form.getValue('identification_type');
	if (idenTypes) {
		var idenTypeList = idenTypes.split(',');
		if (idenTypeList.length > 2) {
			g_form.showFieldMsg('identification_type', new GwtMessage().getMessage("You cannot choose more than two identification types"), 'error');
			return false;
		}
	}
	
	if (g_form.getValue("public_access") == 'true') {
		var ret = isWord(gel('pwd_process.url_suffix').value);
		if (!ret) {
			g_form.showFieldMsg('url_suffix', new GwtMessage().getMessage("The 'URL Suffix' must be an alphanumeric word"), 'error');
		}
		return ret;
	}
	
	
	
}

function isWord(str) {
    var pattern = /^\w+$/;
    return (str.match(pattern) != null);
}

function isValidUrl(url) {
	if (url.startsWith('/') || url.startsWith('http')) {
		return true;
	}
	return false;
}
