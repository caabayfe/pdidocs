function onLoad() {
    if (g_form.isNewRecord())
        g_form.setValue('binding_function', "function getBinding(go, source, target, dispatch, resolveThemeVariable) {\n    var fill = resolveThemeVariable('--now-color--primary-0'); // Syntax to retrieve the value associated with the specified theme variable\n    var background = resolveThemeVariable('--now-color--primary-0', false); // Syntax to retrieve the rgb value associated with the specified color theme variable. By default, returns hex value\n    return new go.Binding(target, source);\n}");
}
