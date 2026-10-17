function onLoad() {
    var criteria = g_form.getValue("criteria");
    if (criteria == "NODE_TO_NODE") {
        g_form.setValue("value", "");
        setDisabledForRelationConstraints(["USER", "NOT_USER", "TIME"]);
    } else if (criteria == "NODE") {
        g_form.setValue("relation_constraint_table", "");
        g_form.setValue("relation_constraint_field", "");
        setDisabledForRelationConstraints(["SAME_CONTEXT", "DIFFERENT_CONTEXT", "SAME_EVENT", "DIFFERENT_EVENT", "SAME_USER", "DIFFERENT_USER"]);
    }

    function setDisabledForRelationConstraints(constraints) {
        options = g_form.getControl("relation_constraint").options;
        for (cnt in options) {
            if (options[cnt].value)
                if (constraints.includes(options[cnt].value)) {
                    options[cnt].disabled = true;
                } else {
                    options[cnt].disabled = false;
                }
        }
    }

}
