function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue === 'true') {
        var searchContext = g_form.getUniqueValue();
        var ga = new GlideAjax('ValidateSACIsPortalRecord');
        ga.addParam('sysparm_name', 'validateSACIsPortalRecord');
        ga.addParam('sysparm_search_context', searchContext);
        ga.getXMLWait();
        var isPortalRecord = ga.getAnswer();
        if (isPortalRecord === 'true') {
            g_form.addInfoMessage(getMessage("Portals do not support exact match. If you enable the exact match option in a portal's search application configuration, users may experience navigation issues when searching in that portal."));
        }
    }
}
