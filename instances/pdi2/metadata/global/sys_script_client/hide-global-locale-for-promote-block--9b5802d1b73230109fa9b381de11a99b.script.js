function onLoad() {
    if (g_scratchpad.rule_action_type && g_scratchpad.rule_action_type != "BOOST")
        g_form.removeOption('locale', 'AIS_GLOBAL_LOCALE');
}
