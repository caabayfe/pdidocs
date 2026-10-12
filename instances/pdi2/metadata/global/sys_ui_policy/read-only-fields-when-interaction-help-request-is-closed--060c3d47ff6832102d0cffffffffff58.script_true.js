function onCondition() {
    var editableFields = ['work_notes', 'state'];
    var fields = g_form.getEditableFields();
    var len = fields.length;
    for (var i = 0; i < len; i++) {
        if (!editableFields.includes(fields[i]))
            g_form.setReadOnly(fields[i], true);
    }
}
