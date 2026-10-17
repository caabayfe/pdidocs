function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var entity = g_form.getReference("entity");
    if (entity && entity.source_type == "AGENTIC_AI_DATA") {
        if (g_form.isNewRecord()) {
            g_form.removeOption("type", "PROPERTY");
            g_form.removeOption("type", "CONTEXT");
        }
    }

}
