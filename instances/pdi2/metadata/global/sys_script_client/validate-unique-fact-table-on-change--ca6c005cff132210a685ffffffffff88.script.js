function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || isTemplate || newValue === oldValue || newValue === '') {
        return;
    }
    var gwt = new GwtMessage();
    g_form.hideFieldMsg('table', true);
    

    if (newValue) {
        var ga = new GlideAjax('PAAnalyticsSourceUtil');
        ga.addParam('sysparm_name', 'checkTableUniqueness');
        ga.addParam('sysparm_table_name', newValue);
        ga.addParam('sysparm_current_sys_id', g_form.getUniqueValue());

        ga.getXMLAnswer(function(answer) {
            if (answer === 'false') {
                var msg = gwt.getMessage("Selected table is linked to a different source and cannot be reused");
                g_form.showFieldMsg('table', msg, 'error', true);
            }
        });
    }
}
