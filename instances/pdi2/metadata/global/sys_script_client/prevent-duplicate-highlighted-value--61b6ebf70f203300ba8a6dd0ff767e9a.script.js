function onSubmit() {
	g_form.clearMessages();
	var ga = new GlideAjax('HighlightedValues');
	ga.addParam('sysparm_name','isDuplicateRecord');
	ga.addParam('sysparm_table', g_form.getValue('table'));
	ga.addParam('sysparm_field', g_form.getValue('field'));
	ga.addParam('sysparm_ws', g_form.getValue('workspace'));
	ga.addParam('sysparm_current_sys_id', g_form.getUniqueValue());
	ga.getXMLWait();
	var answer = ga.getAnswer();
	if (answer === 'fail') {
	    g_form.addErrorMessage("There was an error validating your submission.");
		return false;
	}
	else if (answer === 'true') {
		g_form.addErrorMessage("There is already an entry for the table, field and workspace combination you have selected");
		return false;
	}
}
