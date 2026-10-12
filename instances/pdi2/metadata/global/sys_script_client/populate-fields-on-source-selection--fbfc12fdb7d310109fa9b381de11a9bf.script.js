function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '') {
        return;
    }

    var indexedSource = g_form.getReference("boost_indexed_source");
    var tableName = indexedSource.source;
    var grAjax = new GlideAjax('AisConfigurationAjax');
    var value = g_form.getValue("boost_field_name");
    var hasOriginal = false;
    grAjax.addParam('sysparm_name', 'getNonTimeColumns');
    grAjax.addParam('sysparm_table_name', tableName);
    grAjax.getXML(function(response) {
        var fields = response.responseXML.documentElement.getAttribute("answer");
        fields = fields.split(',');
        fields.push("sys_tags");
        fields.sort();
        g_form.clearOptions('boost_field_name');
        g_form.clearValue('boost_field_name');
        for (var i = 0; i < fields.length; i++) {
            g_form.addOption('boost_field_name', fields[i], fields[i]);
            if (fields[i] == value)
                hasOriginal = true;
        }
        if (hasOriginal) {
            g_form.setValue("boost_field_name", value);

        } else if (value) {
            g_form.showFieldMsg("boost_field_name", "Selected field value has been reset", "warning");
        }
    });
}
