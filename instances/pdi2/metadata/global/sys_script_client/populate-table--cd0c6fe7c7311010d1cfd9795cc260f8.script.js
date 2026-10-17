function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    var grAjax = new GlideAjax('AisConfigurationAjax');
    grAjax.addParam('sysparm_name', 'getTablesInDatasource');
    var datasourceSysId = g_form.getValue("datasource");
    grAjax.addParam('datasourceSysId', datasourceSysId);
    grAjax.getXML(function(response) {
        var tables = response.responseXML.documentElement.getAttribute("answer");
        tables = tables.split(',');
        g_form.clearOptions('table');
        for (var i = 0; i < tables.length; i++)
            g_form.addOption('table', tables[i], tables[i]);
    });
}
