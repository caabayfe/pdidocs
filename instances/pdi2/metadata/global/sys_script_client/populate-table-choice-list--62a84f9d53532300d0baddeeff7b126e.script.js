function onLoad() {
    //Get a list of tables that extends the configured index-able table as the choice list
	if (g_form.getValue('ts_configuration')) {
		var ga = new GlideAjax("TSConfigurationAjax");
		ga.addParam('sysparm_name', 'getAllExtensions');
		ga.addParam("sysparm_ts_configuration", g_form.getValue('ts_configuration'));
        // We are using a synchronous ajax call, so that isLoading of onChange method will be true. That will safegaurd us not making calls to load column choice field options. g_form.addOption triggers onChange always.
        ga.getXMLWait();
        var answer = ga.getAnswer();
        var options = answer.split(',');
        for (var i = 0; i < options.length; i++) {
            g_form.addOption('table', options[i], options[i]);
        }

        loadColumnsChoiceFieldOptions();
    }
}

function loadColumnsChoiceFieldOptions() {
    var tableName = g_form.getValue("table");
    if (tableName) {
        var grAjax = new GlideAjax('TSConfigurationAjax');
        grAjax.addParam('sysparm_name', 'getColumns');
        grAjax.addParam('sysparm_table_name', tableName);
        grAjax.addParam('sysparm_ts_configuration', g_form.getValue('ts_configuration'));
        grAjax.getXML(function(response) {
            var columns = response.responseXML.documentElement.getAttribute("answer");
            columns = columns.split(',');
            for (var i = 0; i < columns.length; i++)
                g_form.addOption('column', columns[i], columns[i]);
        });
    }
}
