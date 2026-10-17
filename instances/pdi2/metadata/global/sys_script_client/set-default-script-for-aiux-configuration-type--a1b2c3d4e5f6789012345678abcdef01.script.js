function onLoad() {
    if (!g_form.isNewRecord())
        return;

    g_form.setValue('type', 'navigation_tabs');
    g_form.setValue('script', '(function(options, input) {\n\tvar experienceId = input.experienceId;\n\n\t// Return navigation configuration\n\treturn {};\n})(options, input);');
}
