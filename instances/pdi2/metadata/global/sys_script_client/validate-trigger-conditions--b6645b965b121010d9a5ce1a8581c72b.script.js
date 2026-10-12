function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
	g_form.setDisplay("expand_synonyms", false);
	var conditions = newValue.toString().split("^");
	for (var i = 0; i < conditions.size(); i++) {
		if ( conditions[i].startsWith("query") ) {
			g_form.setDisplay("expand_synonyms", true);
		}
	}
	
    var ga = new GlideAjax('global.AisQueryRuleConditionUtils');
    ga.addParam('sysparm_name', 'validateEncodedQueryString');
    ga.addParam('sysparm_query', newValue);
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer == 'ok') {
            g_form.hideFieldMsg('trigger');
            return;
        } else {
            g_form.showFieldMsg('trigger', answer, 'error');
        }
    });
}
