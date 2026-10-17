function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    // skip setting new value if it was last modified by the user and the value is not blank
    if (g_scratchpad.nameLastModifiedBy === 'user' && g_form.getValue('name')) {
        return;
    }

	// replace non-alphanumeric characters with _
	var name = newValue.replace(/[^a-zA-Z0-9_]/g, '_');

    // compact any multiple sequential underscores
    while (name.indexOf("__") != -1)
        name = name.replace(/__/g, "_");

	// replace any trailing underscores
    while (name != '' && name.charAt(name.length - 1) == '_')
        name = name.substring(0, name.length - 1);

	// add non-global scope as a prefix
    var scope = g_scratchpad.scope;
	var prefix = (scope == 'global') ? '' : scope + '__';

	g_scratchpad.nameLastModifiedBy = 'script';
	g_form.setValue('name', prefix + name);
   
}
