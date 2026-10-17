function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (!isLoading) {
        var currContextId = g_form.getUniqueValue();
        var currContextTable = g_form.getValue('context');
        var currContextActiveStatus = g_form.getValue("active");
        if (g_form.isNewRecord()) {
            showWarningonDuplicateContext(currContextId, currContextTable, currContextActiveStatus);
        }
        if (!g_form.isNewRecord() && oldValue != '' && newValue != oldValue) {
            var ga = new GlideAjax('sn_nb_action.GetRAParentContextMethods');
            ga.addParam('sysparm_name', 'hasExtendedContextRecords');
            ga.addParam('sysparm_currContextId', currContextId);
            ga.getXMLAnswer(function(response) {
                var message, type;
                if (response === "true") {
                    message = getMessage("Enabling or disabling this context may impact extended contexts inherting rules from this context and  alter the Recommended Action component's behavior. Please review extended context records and verify the Context ID in the component properties to ensure proper functionality.");
                    type = "warning";
                    g_form.addFormMessage(message, type);
                } else {
                    message = getMessage("Enabling or disabling the context may affect the default behavior of the Recommended Action component. Please ensure that the correct Context ID is set on the component to avoid unexpected results.");
                    type = "warning";
                    g_form.addFormMessage(message, type);
                }
            });
        }
    }
}

function showWarningonDuplicateContext(currContextId, currContextTable, currContextActiveStatus) {
    var glideAjax = new GlideAjax('sn_nb_action.GetRAParentContextMethods');
    glideAjax.addParam('sysparm_name', 'isDuplicateContextRecordPresent');
    glideAjax.addParam('sysparm_currContextId', currContextId);
    glideAjax.addParam('sysparm_currContextTable', currContextTable);
    glideAjax.addParam('sysparm_currContextActiveStatus', currContextActiveStatus);
    glideAjax.getXMLAnswer(function(response) {
        var message, type;
        if (response === "true") {
            message = getMessage("Multiple active contexts exist for the selected table. Please ensure that the correct Context ID is set on the component to avoid unexpected results. Refer to the product documentation for details.");
            type = "warning";
            g_form.addFormMessage(message, type);
        }
    });
}
