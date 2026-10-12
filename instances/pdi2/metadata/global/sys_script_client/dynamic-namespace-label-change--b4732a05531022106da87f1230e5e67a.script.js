function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var name = g_form.getValue('name');
    // If name is already set, we don't change it automatically here.
    if (name && name != '' && !g_form.isNewRecord())
        return;

    var newName = createNameFromLabel(newValue);
    g_form.setValue('name', newName);
}

function createNameFromLabel(label) {
	// We allow a single '/' in the name
    var index_slash = label.indexOf('/');
    var name;
    if (index_slash > 0) {
        name = sanitize(label.substring(0, index_slash)) +
            "/" + sanitize(label.substring(index_slash + 1));
    } else {
        name = sanitize(label);
    }

    return name;
}

function sanitize(label) {
    var name = label.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Replace any starting or trailing underscores
    name = name.replace(/^_+/, '').replace(/_+$/, '');

    // Compact any multiple sequential underscores
    while (name.indexOf("__") != -1)
        name = name.replace(/__/g, "_");

    // Replace any starting or trailing underscores
    return name;
}
