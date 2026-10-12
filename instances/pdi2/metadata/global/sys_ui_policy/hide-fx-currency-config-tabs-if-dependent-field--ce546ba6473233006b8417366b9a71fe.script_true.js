function onCondition() {
	if (g_form.isNewRecord())
		return;

	var ga = new GlideAjax("FxCurrencyConfigDependentFieldUtils");
    ga.addParam("sysparm_name", "isConfigForDependedField");
    ga.addParam("sysparm_sys_id", g_form.getUniqueValue());

    ga.getXMLAnswer(changeUIElements);

    function changeUIElements(answer) {
        var showSections = !(answer == 'true');
        g_form.setSectionDisplay('currency', showSections);
        g_form.setSectionDisplay('rate_table', showSections);
        g_form.setSectionDisplay('rate_filter', showSections);
    }
}
