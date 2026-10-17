function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var visibleFields = ['content_type', 'topic'];
    var contentType = g_form.getValue("content_type");
	
    if (contentType) {
        var contentRefField = g_scratchpad.referenceFieldMap[contentType];
        visibleFields.push(contentRefField);
    }

    var allFields = g_form.elements;
    for (var i = 0; i < allFields.length; i++) {
        var fieldName = g_form.elements[i].fieldName;
        if (visibleFields.indexOf(fieldName) == -1) {
            g_form.setMandatory(fieldName, false);
            g_form.clearValue(fieldName);
            g_form.setDisplay(fieldName, false);
        } else {
            g_form.setDisplay(fieldName, true);
            g_form.setMandatory(fieldName, true);
        }
    }
}
