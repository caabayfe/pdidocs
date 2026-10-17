function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var ga = new GlideAjax('sn_ex_sp.GetSearchApplicationByPortal');
    ga.addParam('sysparm_name', 'getSearchApplication');
    ga.addParam('portalSysId', newValue);
    ga.getXMLAnswer(function(response) {
        if (response) {
            g_form.setValue('search_application', response);
        } else {
            g_form.setValue('search_application', '');
        }
    });
}
