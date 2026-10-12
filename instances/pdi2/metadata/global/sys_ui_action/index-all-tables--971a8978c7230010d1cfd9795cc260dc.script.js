function indexDatasource() {
    var datasource = g_form.getValue('source');
    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'indexDatasourceNoBlocking');
    ga.addParam('sysparm_ais_datasource', datasource);
    ga.getXML(function(response) {
        var id = response.responseXML.documentElement.getAttribute("answer");
        if (id) {
            var url = '/ais_ingest_datasource_stats.do?sys_id=';
            url += id;
            window.location = url;
        }
    });
}
