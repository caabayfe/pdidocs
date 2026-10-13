function onCondition() {
    if (!g_form.getValue('translate_sub_flow')) {
        g_form.setValue('default_provider', false);
        getMessage('Before setting a default translator for translation, select a translate subflow', function(translatedMsg) {
            g_form.showFieldMsg('default_provider', translatedMsg, 'warning', true);
        });
    } else if (g_form.getValue('active') === 'false') {
        g_form.setValue('default_provider', false);
        getMessage('Before setting a default translator for translation, mark the translator as active', function(translatedMsg) {
            g_form.showFieldMsg('default_provider', translatedMsg, 'warning', true);
        });
    } else if (g_scratchpad.default_translation && g_form.getValue('name') !== g_scratchpad.default_translation) {
        g_form.setValue('default_provider', false);
        getMessage('{0} is your current default translator for translation. Clear its Default checkbox, before marking this as default.', function(translatedMsg) {
            var message = new GwtMessage().format(translatedMsg, g_scratchpad.default_translation);
            g_form.showFieldMsg('default_provider', message, 'warning', true);
        });
    }
}
