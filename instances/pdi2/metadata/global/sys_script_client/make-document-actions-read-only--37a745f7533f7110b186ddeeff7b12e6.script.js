function onLoad() {
    //Type appropriate comment here, and begin script below
    if (!g_form.isNewRecord()) {
        var fields = g_form.getEditableFields();
        for (var i = 0; i < fields.length; i++) {
            g_form.setReadOnly(fields[i], true);
        }
    }
}
