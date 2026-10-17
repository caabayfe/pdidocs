function onCondition() {
   if (g_form.getValue('default_detection') === 'true' && g_form.getValue('default_provider') === 'true') {
        g_form.setValue('active', true);
        getMessage('Default translator for detection and translation cannot be inactive', function(translatedMsg) {
            g_form.showFieldMsg('active', translatedMsg, 'warning', true);
        });
    } else if (g_form.getValue('default_detection') === 'true') {
        g_form.setValue('active', true);
        getMessage('Default translator for detection cannot be inactive', function(translatedMsg) {
            g_form.showFieldMsg('active', translatedMsg, 'warning', true);
        });
    } else if (g_form.getValue('default_provider') === 'true') {
        g_form.setValue('active', true);
        getMessage('Default translator for translation cannot be inactive', function(translatedMsg) {
            g_form.showFieldMsg('active', translatedMsg, 'warning', true);
        });
    }
}
