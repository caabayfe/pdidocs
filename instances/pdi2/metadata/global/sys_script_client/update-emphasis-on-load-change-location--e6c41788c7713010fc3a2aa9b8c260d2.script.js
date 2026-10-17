function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        if (newValue != 'footer' && newValue != 'media_section')
            removeColorThemesFromChoiceList();

        return;
    }

    if (newValue != 'footer' && newValue != 'media_section') {
        removeColorThemesFromChoiceList();
    } else 
		addColorThemesToChoiceList();

    g_form.setValue('color_theme', "");
}

function removeColorThemesFromChoiceList() {
    g_form.removeOption('color_theme', 'primary');
    g_form.removeOption('color_theme', 'secondary');
}

 function addColorThemesToChoiceList() {
    g_form.addOption('color_theme', 'primary', 'Primary', 1);
    g_form.addOption('color_theme', 'secondary', 'Secondary', 3);
}
