function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	var component = g_form.getReference("action").action_component;

	if (!component) {
		g_form.setValue('action_attributes', '{}');
		return;
	}

	var ajax  = new GlideAjax ('DAUtility');
	ajax.addParam('sysparm_name','getComponentAttributesAjax');
	ajax.addParam('sysparm_componentSysId', component);
	ajax.getXML(function(response) {
		var answer = response.responseXML.documentElement.getAttribute('answer');
		var attr = answer.evalJSON();
		var keyPairObj = attr.reduce(function(acc, current) {
			acc[current] = '';
			return acc;
		}, {});

		g_form.setValue('action_attributes', JSON.stringify(keyPairObj));
	});
}
