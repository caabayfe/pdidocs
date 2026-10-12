function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var model = g_scratchpad.change_model;
    if (!model)
        return;

    if (model && model.mandatory_fields)
        g_scratchpad.change_model.refreshMandatoryFields();
}
