function onLoad() {
    // disallow es latest javascript mode for global scoped applications until they are supported
    var scope = g_form.getValue('scope');
    if (scope == 'global')
        g_form.removeOption('js_level', 'es_latest');
}
