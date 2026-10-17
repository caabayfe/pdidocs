function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.setValue("field_value", "");
    g_form.setValue("field_display_value", "");

    var ga = new GlideAjax('global.ProminUtilsAJAX');
    ga.addParam('sysparm_name', 'isStringField');
    ga.addParam('sysparm_table', g_form.getValue("table"));
    ga.addParam('sysparm_field', g_form.getValue("field"));
    ga.getXML(isStringFieldResponse);

    function isStringFieldResponse(response) {
        var isStringField = response.responseXML.documentElement.getAttribute("answer");
		var disablePredicate = (isStringField == 'true');
		var options = g_form.getControl("predicate").options;
		for (var counter = 0; counter < options.length; counter++) {
			var option = options[counter];
			if (option.value == 'STARTS_WITH' || option.value == 'ENDS_WITH' || option.value == 'LIKE' || option.value == 'NOT_LIKE') {
				option.disabled = disablePredicate;
			}
		}
    }
}
