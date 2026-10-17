function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var editableFieldsMap = g_scratchpad.versioning ? g_scratchpad.versioning.editableFieldsMap : null;
    if (newValue == '') {
        g_form.setReadOnly("workflow_state", true);
        g_form.setReadOnly("kb_category", true);
        return;
    } else {
        // Honor editable fields property
        if (!editableFieldsMap || editableFieldsMap.kb_category) {
            g_form.setReadOnly("kb_category", false);
        }

        g_form.getReference("kb_knowledge_base", function(response) {
            if (response.kb_version == 3) {
                g_form.setReadOnly("workflow_state", true);
            } else {
                // Honor editable fields property
                if (!editableFieldsMap || editableFieldsMap.category)
                    g_form.setReadOnly("category", false);

                // Honor editable fields property
                if (!editableFieldsMap || editableFieldsMap.workflow_state)
                    g_form.setReadOnly("workflow_state", false);
            }



        });
    }
}
