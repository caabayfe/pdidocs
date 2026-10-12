function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (!isLoading && newValue == 'fadcf88eb7103300abfad298ee11a91e') {
        var grAjax = new GlideAjax('TSConfigurationAjax');
        grAjax.addParam('sysparm_name', 'getColumns');
        grAjax.addParam('sysparm_table_name', g_form.getValue('table'));
        grAjax.addParam('sysparm_ts_configuration', g_form.getValue('ts_configuration'));
        grAjax.addParam('sysparm_attribute_sys_id', newValue);
        grAjax.getXML(function(response) {
            var columns = response.responseXML.documentElement.getAttribute("answer");
            columns = columns.split(',');
            g_form.clearOptions('column');
            for (var i = 0; i < columns.length; i++)
                g_form.addOption('column', columns[i], columns[i]);
        });
    }
}
