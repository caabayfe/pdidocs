function onCondition() {
	var cimd_fields = ['redirect_url', 'client_uri', 'response_types'];
    for (var i = 0; i < cimd_fields.length; i++) {
        g_form.setDisplay(cimd_fields[i], true);
    }
	g_form.setMandatory('redirect_url', true);

}
