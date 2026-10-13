function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_scratchpad.isOOB === 'true') {
        g_form.setReadOnly('name', 'true');
        g_form.setReadOnly('translate_sub_flow', 'true');
        g_form.setReadOnly('detect_sub_flow', 'true');
        g_form.setReadOnly('version', 'true');
        g_form.setReadOnly('language_code_mappings', 'true');
        getMessage('For a translator configuration that is available by default, you can only modify the Active and Default fields.', function(translatedMsg) {
            g_form.addInfoMessage(translatedMsg);
        });
    }
}
