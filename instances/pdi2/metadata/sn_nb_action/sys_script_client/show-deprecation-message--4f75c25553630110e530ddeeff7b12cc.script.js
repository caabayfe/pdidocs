function onLoad() {
    if (g_form.getValue('set_action_inputs_dynamically') == 'true') {
        getMessage('Input generators are no longer supported and can\'t be used. Use a resource generator instead for automatic inputs.',
            function(translatedMsg) {
                g_form.addInfoMessage(translatedMsg);
            });
    } else {
        g_form.setDisplay('set_action_inputs_dynamically', false);
        g_form.setDisplay('action_input_generator', false);
    }
}
