function onLoad() {
    if (g_scratchpad.isOOB === 'true') {
        g_form.setReadOnly('translator_configuration', 'true');
        g_form.setReadOnly('prefix_pattern', 'true');
        g_form.setReadOnly('suffix_pattern', 'true');
        getMessage('For a exclusion provider pattern that is available by default, you can only modify the Active field.', function(translatedMsg) {
            g_form.addInfoMessage(translatedMsg);
        });
    }
}
