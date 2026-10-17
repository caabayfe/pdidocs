function onLoad() {
    var grAjax = new GlideAjax('AisConfigurationAjax');
    var value = g_form.getValue("component_field_name");
    grAjax.addParam('sysparm_name', 'getValidComponentFieldsForSource');
    grAjax.addParam('sysparm_table_name', g_form.getValue("source"));
    grAjax.getXML(function(response) {
        var fields = response.responseXML.documentElement.getAttribute("answer");
        fields = fields.split(',');
        // To maintain an alphabetical order
        g_form.clearOptions('component_field_name');
        for (var i = 0; i < fields.length; i++)
            g_form.addOption('component_field_name', fields[i], fields[i]);

        if (value)
            g_form.setValue("component_field_name", value);

    });
}
