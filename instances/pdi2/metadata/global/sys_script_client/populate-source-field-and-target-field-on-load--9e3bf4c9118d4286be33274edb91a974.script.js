function onLoad() {
    var bindingValue = g_form.getValue('interface_impl_binding');

    if (!bindingValue) {
        g_form.clearOptions('source_field');
        g_form.addOption('source_field', '', '-- Select a binding first --');
        g_form.clearOptions('target_field');
        g_form.addOption('target_field', '', '-- Select a binding first --');
        return;
    }

    var savedSourceField = g_form.getValue('source_field');
    var savedTargetField = g_form.getValue('target_field');

    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getInterfaceFields');
    ga.addParam('sysparm_binding_id', bindingValue);
    ga.getXMLAnswer(function (answer) {
        g_form.clearOptions('source_field');
        g_form.addOption('source_field', '', '-- Select --', 0);

        var fields = JSON.parse(answer || '[]');
        for (var i = 0; i < fields.length; i++) {
            g_form.addOption('source_field', fields[i].name, fields[i].label);
        }

        if (savedSourceField)
            g_form.setValue('source_field', savedSourceField);

        _populateTargetField(bindingValue, savedSourceField, savedTargetField);
    });
}

function _populateTargetField(bindingValue, sourceFieldValue, savedTargetField) {
    if (!sourceFieldValue) {
        g_form.clearOptions('target_field');
        g_form.addOption('target_field', '', '-- Select an interface field first --');
        return;
    }

    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getCompatibleImplementationFields');
    ga.addParam('sysparm_binding_id', bindingValue);
    ga.addParam('sysparm_field_name', sourceFieldValue);
    ga.getXMLAnswer(function (answer) {
        g_form.clearOptions('target_field');

        var fields = JSON.parse(answer || '[]');
        if (fields.length === 0) {
            g_form.addOption('target_field', '', '-- No compatible fields --');
            return;
        }

        g_form.addOption('target_field', '', '-- Select --', 0);
        for (var i = 0; i < fields.length; i++) {
            g_form.addOption('target_field', fields[i].name, fields[i].label);
        }

        if (savedTargetField)
            g_form.setValue('target_field', savedTargetField);
    });
}
