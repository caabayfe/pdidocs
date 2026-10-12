function onLoad() {
    var entity = g_form.getReference("entity");
    if (entity && entity.source_type == "AGENTIC_AI_DATA") {
        var fields = g_form.getEditableFields();
        for (var x = 0; x < fields.length; x++) {
            g_form.setReadOnly(fields[x], true);
        }
        g_form.getControl("field").nextSibling.nextSibling.disabled = true;
        g_form.getControl("field").nextSibling.nextSibling.innerText = g_form.getValue("field");
    }
}
