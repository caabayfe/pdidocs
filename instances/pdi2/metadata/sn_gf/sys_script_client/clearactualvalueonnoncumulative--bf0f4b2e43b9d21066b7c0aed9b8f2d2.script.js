function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var goalFrameworkAjaxProcessor = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
    goalFrameworkAjaxProcessor.addParam('sysparm_name', 'targetHasBreakdowns');
    goalFrameworkAjaxProcessor.addParam('sysparm_target_sys_id', g_form.getUniqueValue());

    goalFrameworkAjaxProcessor.getXMLAnswer(function(response) {
        var answer = JSON.parse(response);
        if (answer && 'targetHasBreakdowns' in answer) {
            var targetHasBreakdowns = answer['targetHasBreakdowns'];

            // g_form.isReadOnly does not work in case of scoped app fields
            var editableFields = g_form.getEditableFields();
            var isActualValueEditable = editableFields.indexOf("actual_value") > -1;

            if ((newValue == "non_cumulative") &&
                (!targetHasBreakdowns || isActualValueEditable)) {
                g_form.clearValue("actual_value");
                g_form.setReadOnly("actual_value", true);
            } else if ((newValue == "cumulative") &&
                (!targetHasBreakdowns && !isActualValueEditable)) {
                g_form.setReadOnly("actual_value", false);
            }
        }
    });
}
