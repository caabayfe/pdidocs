function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue) {
        var grAjax = new GlideAjax('AisConfigurationAjax');
        var value = g_form.getValue("field");
        grAjax.addParam('sysparm_name', 'getColumns');
        grAjax.addParam('sysparm_table_name', newValue);
        grAjax.getXML(function(response) {
            var fields = response.responseXML.documentElement.getAttribute("answer");
            fields = fields.split(',');
			// To maintain an alphabetical order
            g_form.clearOptions('field');
            for (var i = 0; i < fields.length; i++)
                g_form.addOption('field', fields[i], fields[i]);
            if (value) {
                g_form.setValue("field", value);
            }
        });
    } else
        g_form.clearOptions('field');
}
