function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
		return;
    }

    var ga = new GlideAjax("FxCurrencyConfigDependentFieldUtils");
    ga.addParam("sysparm_name", "isDependent");
    ga.addParam("sysparm_field_name", g_form.getValue("target_field"));
    ga.addParam("sysparm_table_name", g_form.getValue("target_table"));

    ga.getXMLAnswer(changeUIElements);

    function changeUIElements(answer) {
        var showSections = !(answer == 'true');
        g_form.setSectionDisplay('currency', showSections);
        g_form.setSectionDisplay('rate_table', showSections);
        g_form.setSectionDisplay('rate_filter', showSections);
    }
}
