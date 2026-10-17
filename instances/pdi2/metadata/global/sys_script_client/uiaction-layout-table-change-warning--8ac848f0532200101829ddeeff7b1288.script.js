function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.isNewRecord()) {
        return; 
    }

	if (oldValue !== newValue) {
		var ga = new GlideAjax('FormViewValidator');
		ga.addParam('sysparm_table', newValue);
		ga.addParam('sysparm_name','isValid');
		ga.addParam('sysparm_view', g_form.getValue('view'));

		var msg = new GwtMessage().getMessage('Please be aware that changing the table may invalidate UI Action group configurations.');
		g_form.showFieldMsg('table', msg);

		ga.getXML(function(response) {
			var answer = response.responseXML.documentElement.getAttribute("answer");
			if (answer === "false")
				g_form.setValue('view', null);
		});
	}
}
