function onLoad() {
    //Type appropriate comment here, and begin script below
    if (!g_form.isNewRecord()) {
        var fields = g_form.getEditableFields();
        for (var i = 0; i < fields.length; i++) {
            g_form.setReadOnly(fields[i], true);
        }
        setTimeout(readOnlyNameValue, 500);
    }
}

function readOnlyNameValue() {
    try {
        // Make the 'u_name_value' field read only
        var fieldName = 'attributes';
        var el = $('element.' + g_form.tableName + '.' + fieldName);
        // Disable inputs
        el.select('input').each(function(elmt) {
            elmt.disabled = true;
        });
        // Disable buttons
        el.select('button').each(function(elmt) {
            elmt.disabled = true;
        });
    } catch (e) {}
}
