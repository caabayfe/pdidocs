function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    if (!g_form.isNewRecord())
        return;

    var templates = {
        navigation_tabs:    '(function(options, input) {\n\tvar experienceId = input.experienceId;\n\n\t// Return navigation configuration\n\treturn {}};\n})(options, input);',
        settings:           '(function(options, input) {\n\tvar experienceId = input.experienceId;\n\n\t// Return settings configuration\n\treturn {};\n})(options, input);'
    };

    if (templates[newValue]) {
        g_form.setValue('script', templates[newValue]);
    }
}
