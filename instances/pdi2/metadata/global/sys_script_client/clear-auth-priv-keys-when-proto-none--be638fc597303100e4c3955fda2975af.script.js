function onSubmit() {
	if (validateFields('authentication') && validateFields('privacy')) {
		if (g_form.getValue('authentication_protocol') == '' && g_form.getValue('privacy_protocol') != '') {
			g_form.addErrorMessage(getMessage('Privacy protocol cannot be set if authentication protocol is none'));
			return false;
		}
	} else
		return false;
	
	function validateFields(type) {
		var proto = g_form.getValue(type+'_protocol');
		var key = g_form.getValue(type+'_key');
		
		if (proto == '')
			g_form.setValue(type+'_key', '');
		else {
			if (key.length == 0)
				g_form.setValue(type+'_protocol', '');
			else if (key.length < 8) {
				g_form.addErrorMessage(getMessage('Key must be at least 8 characters in length'));
				return false;
			}
		}
		
		return true;
	}
}
