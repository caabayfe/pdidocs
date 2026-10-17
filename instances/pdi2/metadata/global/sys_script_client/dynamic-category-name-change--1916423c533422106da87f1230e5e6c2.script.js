function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !newValue || g_form.isDisabled('name'))
        return;

    var name = newValue.trim();
    if (!name)
        name = g_form.getValue('label').trim();

    if (!name)
        return;

    var namespace = g_form.getValue('namespace');
    var itemScope = g_scratchpad.scope;
    var containerScope = getNamespaceScope(namespace);

    ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {

        var sanitizer = new DBNameSanitizer();
        name = sanitizer.trimName(name);
        if (!name)
            return;

        var prefix = getPrefix(sanitizer, itemScope, containerScope);
        if (!name.startsWith(prefix))
            name = prefix + name;

        if (name !== newValue)
            g_form.setValue('name', name);

    });
}

function getPrefix(sanitizer, itemScope, containerScope) {
    itemScope = itemScope.trim().toLowerCase() || 'global';
    containerScope = containerScope.trim().toLowerCase() || 'global';

    if (g_user.hasRole('maint'))
        return sanitizer.MAINT_PREFIX;

    if (itemScope === 'global' || isStoreApp(itemScope))
        return sanitizer.CUSTOMER_PREFIX;

    if (itemScope === containerScope)
        return sanitizer.MAINT_PREFIX;

    return itemScope + sanitizer.VENDOR_PREFIX_DELIMCHAR;
}

function isStoreApp(scope) {
    var gr = new GlideRecord('sys_scope');
    gr.addQuery('scope', scope);
	gr.addQuery('sys_class_name', 'sys_store_app');
    gr.query();
    return gr.next();
}

function getNamespaceScope(namespace) {
    var gr = new GlideRecord('dynamic_namespace');
    gr.addQuery('name', namespace);
    gr.query();
    if (!gr.next())
        return 'global';

    var scopeId = gr.getValue('sys_scope');
    gr = new GlideRecord('sys_scope');
    var scope = gr.get(scopeId) ? gr.getValue('scope') : 'global';
    return scope.trim().toLowerCase() || 'global';
}
