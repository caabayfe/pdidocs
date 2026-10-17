function onCondition() {
    if (!g_form.getValue('detect_sub_flow')) {
        g_form.setValue('default_detection', false);
        getMessage('Before setting a default translator for detection, select a detect subflow', function(translatedMsg) {
            g_form.showFieldMsg('default_detection', translatedMsg, 'warning', true);
        });
    } else if (g_form.getValue('active') === 'false') {
        g_form.setValue('default_detection', false);
        getMessage('Before setting a default translator for detection, mark the translator as active', function(translatedMsg) {
            g_form.showFieldMsg('default_detection', translatedMsg, 'warning', true);
        });
    } else if (g_scratchpad.default_detection && g_form.getValue('name') !== g_scratchpad.default_detection) {
        g_form.setValue('default_detection', false);
        getMessage('{0} is your current default translator for detection. Clear its Default checkbox, before marking this as default.', function(translatedMsg) {
            var message = new GwtMessage().format(translatedMsg, g_scratchpad.default_detection);
            g_form.showFieldMsg('default_detection', message, 'warning', true);
        });
    }
}
