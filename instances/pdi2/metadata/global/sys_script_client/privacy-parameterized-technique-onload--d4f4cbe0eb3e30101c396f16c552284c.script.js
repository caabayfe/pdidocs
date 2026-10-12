function onLoad() {
	if (g_form.isNewRecord())
		return;
	populateParameterValues(g_form.getUniqueValue(), g_form.getValue('technique'));

	var technique = g_form.getValue('technique');
	if( technique == '26314c3373023010fb1d1f877bf6a711') {
		g_form.addWarningMessage(getMessage('This technique is deprecated and not recommended to be used. Consider using Static Replace or Random Replace instead.'));
	}
}

function populateParameterValues(recordId, technique) {
	var ga = new GlideAjax('global.PrivacyPopulateParameterValues');
	ga.addParam('sysparm_name', 'populateValues');
	ga.addParam('sysparm_parameterizedTechniqueId', recordId);
	ga.addParam('sysparm_techniqueId', technique);
	ga.getXML();
}
