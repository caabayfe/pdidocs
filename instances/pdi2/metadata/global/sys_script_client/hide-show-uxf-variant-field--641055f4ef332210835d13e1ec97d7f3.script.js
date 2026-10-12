function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Clear the UXF variant field when theme changes
    if (!isLoading && oldValue !== newValue) {
        g_form.setValue('matching_now_experience_theme_variant', '');
    }
    
    g_form.getReference('theme', function(themeRecord) {        
        var hasUXFTheme = Boolean(themeRecord && themeRecord.matching_now_experience_theme);
        
        g_form.setDisplay('matching_now_experience_theme_variant', hasUXFTheme);
        if (!hasUXFTheme) {
            g_form.setValue('matching_now_experience_theme_variant', '');
        }
    });
}
