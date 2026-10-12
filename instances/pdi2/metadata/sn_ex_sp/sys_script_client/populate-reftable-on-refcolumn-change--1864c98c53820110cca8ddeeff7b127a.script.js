function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (isLoading) {
        return;
    }
    if (newValue == '') {
        g_form.setValue('reference_table', '');
        g_form.setMandatory('reference_table', false);
        g_form.setDisplay('reference_table', false);
        g_form.setDisplay('reference_conditions', false);
        return;
    }

    var ga = new GlideAjax('TaskConfigurationClientUtil');
    ga.addParam('sysparm_name', 'getTableList');
    ga.addParam('sysparm_tablename', g_form.getValue('table'));
    ga.addParam('sysparm_columnname', g_form.getValue('reference_column'));
    ga.getXML(populateTableList);

    function populateTableList(response) {
        g_form.clearOptions('reference_table');
        g_form.setMandatory('reference_table', true);
        g_form.setDisplay('reference_table', true);
        g_form.setDisplay('reference_conditions', false);

        var msg = response.responseXML.documentElement.getAttribute('answer');
        var parseData = JSON.parse(msg);
        var tables = parseData.tables;
        if (parseData && tables && tables.length > 0) {
            g_form.addOption('reference_table', '', '-- None --');
            tables.forEach(function(table) {
                g_form.addOption('reference_table', table.name, table.label + ' [' + table.name + ']');
            });
        }
        if (parseData && parseData.columnType == 'table_name') {
            g_form.setDisplay('reference_conditions', true);
        }
    }

}
