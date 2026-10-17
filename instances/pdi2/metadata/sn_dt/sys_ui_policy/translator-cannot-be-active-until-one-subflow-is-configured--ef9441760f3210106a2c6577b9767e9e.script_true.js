function onCondition() {
   if (!g_form.getValue('detect_sub_flow') && !g_form.getValue('translate_sub_flow')) {
        g_form.setValue('active', false);
        getMessage('Before marking a translator as active, configure a detect or translate subflow', function(translatedMsg) {
            g_form.showFieldMsg('active', translatedMsg, 'warning', true);
        });
    }
}
