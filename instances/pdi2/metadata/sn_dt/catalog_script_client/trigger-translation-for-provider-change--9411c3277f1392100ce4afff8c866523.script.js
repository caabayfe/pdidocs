function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    if (newValue != oldValue) {
        g_form.setValue('inputs_changed', true);

        var langMap = JSON.parse(g_form.getValue('languages_by_provider'));

        g_form.clearOptions('target_language');
        g_form.clearOptions('target_language_selected');

        var currentProviderLangs = langMap[newValue];
        for (var i = 0; i < currentProviderLangs.length; i++) {
            var lang = currentProviderLangs[i];

            g_form.addOption('target_language', lang.code, lang.name);
            g_form.addOption('target_language_selected', lang.code, lang.name);

            if (i === 0) {
                g_form.setValue('target_language', lang.code);
            }
        }
    }
}
