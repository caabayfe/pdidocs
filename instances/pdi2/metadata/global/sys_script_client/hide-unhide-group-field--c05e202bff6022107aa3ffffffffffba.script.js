function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    checkTriggerGroup();
}

function checkTriggerGroup() {
    if (g_form.getValue('run_trigger') == 'run_once') {
        g_form.setDisplay('group', true);
		g_form.setMandatory('group', true);
        return;
    }
    var gajax = new GlideAjax("OnCallCommonUtilsAjax");
    gajax.addParam("sysparm_name", "isTriggerGroupFieldPresent");
    gajax.addParam("sysparm_trigger_fields", g_form.getValue('trigger_fields'));
    gajax.getXMLAnswer(function(result) {
		g_form.setMandatory('group', result == 'false');
		g_form.setDisplay('group', result == 'false');
        if (result !== 'false') {
            g_form.setValue('group', '');
        }
    });
}
