function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    var editableFields = g_form.getEditableFields();
    var isActualValueReadOnly = editableFields.indexOf("actual_value") == -1;

    if (newValue == "" && isActualValueReadOnly) {

        var goalFrameworkAjaxProcessor = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
        goalFrameworkAjaxProcessor.addParam('sysparm_name', 'targetHasBreakdowns');
        goalFrameworkAjaxProcessor.addParam('sysparm_target_sys_id', g_form.getUniqueValue());

        goalFrameworkAjaxProcessor.getXMLAnswer(function(response) {
            var answer = JSON.parse(response);
            if (answer && 'targetHasBreakdowns' in answer) {
                var targetHasBreakdowns = answer['targetHasBreakdowns'];
                if (!targetHasBreakdowns) {
                    g_form.setReadOnly("actual_value", false);
                }
            }
        });
    }
}
