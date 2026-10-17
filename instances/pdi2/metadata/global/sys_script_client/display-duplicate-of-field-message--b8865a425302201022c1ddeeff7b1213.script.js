function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var ga = new GlideAjax('ProblemUtilsClientSNC');
    ga.addParam('sysparm_name', 'isDisplayWarningTaskMove');
    ga.addParam('sysparm_trgtPrbSysId', g_form.getValue('duplicate_of'));
    ga.addParam('sysparm_srcPrbSysId', g_form.getUniqueValue());
    ga.getXMLAnswer(processMessage);

    function processMessage(answer) {
        if (answer === 'true') {
            g_form.showFieldMsg('duplicate_of', getMessage("The selected problem is closed. This will lead to open problem tasks being canceled when they are moved over. If you do not want this to happen, either Cancel or select an open problem"), 'warning');
        } else {
            g_form.hideFieldMsg('duplicate_of');
        }
    }
}
