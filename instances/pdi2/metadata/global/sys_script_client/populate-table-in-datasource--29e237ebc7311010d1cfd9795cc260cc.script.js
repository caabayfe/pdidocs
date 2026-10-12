function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var grAjax = new GlideAjax('AisConfigurationAjax');
    grAjax.addParam('sysparm_name', 'getChildTablesInDatasource');
    var datasource = g_form.getValue("datasource");
    grAjax.addParam('dataSourceSysId', datasource);
    grAjax.getXML(function(response) {
        var sources = response.responseXML.documentElement.getAttribute("answer");
        sources = sources.split(',');
        g_form.clearOptions('source');
        for (var i = 0; i < sources.length; i++)
            g_form.addOption('source', sources[i], sources[i]);
    });
}
