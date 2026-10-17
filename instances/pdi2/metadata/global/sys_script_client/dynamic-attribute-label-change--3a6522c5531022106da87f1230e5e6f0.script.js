function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !newValue || g_form.isDisabled('name'))
        return;

	var name = g_form.getValue('name');
    var namespace = g_form.getValue('namespace');

    // If name is already set, we don't change it automatically here.
    if (name && name != '' && !g_form.isNewRecord())
        return;

    ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {

        var sanitizer = new DBNameSanitizer();

        name = sanitizer.trimName(newValue);
        if (!name)
            return;

        var prefix = getPrefix(sanitizer, namespace);
        if (!name.startsWith(prefix))
            name = prefix + name;

        g_form.setValue('name', name);

    });
}

function getPrefix(sanitizer, withinScopedContext) {
    var scope = g_scratchpad.scope;

    if (g_user.hasRole('maint'))
        return sanitizer.MAINT_PREFIX;

    if (scope === 'global' || isStoreApp(scope))
        return sanitizer.CUSTOMER_PREFIX;

    if (withinScopedContext.indexOf(scope) < 0)
        return scope + sanitizer.VENDOR_PREFIX_DELIMCHAR;

    return sanitizer.MAINT_PREFIX;
}

function isStoreApp(scope) {
    var gr = new GlideRecord('sys_scope');
    gr.addQuery('scope', scope);
    gr.query();
    if (gr.next())
        return gr.getValue('sys_class_name') === 'sys_store_app';
    return false;
}
