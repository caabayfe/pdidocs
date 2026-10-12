function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        //  return;
    }
	if (g_form.getValue("criteria") == "NODE") {
        return;
    }
    var sourceCondition = g_form.getReference('source_condition');
    var sinkCondition = g_form.getReference('sink_condition');
    // conditions from same entity or same process will have same table
    if (sourceCondition.table == sinkCondition.table) {
        g_form.setValue("relation_constraint_table", sinkCondition.table);
        var options = g_form.getControl("relation_constraint").options;
        for (var cnt in options) {
            if (options[cnt].disabled) {
                options[cnt].disabled = false;
            }
        }
        if (!(sourceCondition.sub_type == "SINGLE" && sinkCondition.sub_type == "SINGLE" && sourceCondition.field == sinkCondition.field)) {
            setDisabledForRelationConstraints(["SAME_EVENT", "DIFFERENT_EVENT"], true);
        }
    } else {
        g_form.setValue("relation_constraint_table", "");
        g_form.setValue("relation_constraint", "");
        setDisabledForRelationConstraints(["SAME_CONTEXT", "DIFFERENT_CONTEXT", "SAME_EVENT", "DIFFERENT_EVENT"], true);
    }

    function setDisabledForRelationConstraints(constraints, isDisabled) {
        options = g_form.getControl("relation_constraint").options;
        for (cnt in options) {
            if (options[cnt].value)
                if (constraints.includes(options[cnt].value)) {
                    options[cnt].disabled = isDisabled;
                }
        }
    }
}
