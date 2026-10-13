function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.setValue('trigger_fields', '');
    g_form.clearOptions('choice.trigger_rule.trigger_fields');
    var gajax = new GlideAjax("OnCallCommonUtilsAjax");
    gajax.addParam("sysparm_name", "getTriggerFieldsChoiceList");
    gajax.addParam("sysparm_table_name", newValue);
    gajax.getXMLAnswer(function(result) {
        var options = JSON.parse(result);
        options.forEach(function(option) {
            g_form.addOption('choice.trigger_rule.trigger_fields', option.value, option.label);
        });
    });

}
