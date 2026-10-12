function onCondition() {
    if (g_form.getValue("advanced_condition_type") == "CROP") {
        g_form.hideFieldMsg("advanced_condition_type", true);
        g_form.showFieldMsg("advanced_condition_type", getMessage("Configure specific start and end state for your process map. For example, discovery process map between New and Resolved state and leaving out the closed state."));
    } else {
        g_form.hideFieldMsg("advanced_condition_type", true);
        g_form.showFieldMsg("advanced_condition_type", getMessage("Configure steps that must occur during the record's lifecycle to be included in the process map. For example, Mine records that transitioned from Work in progress to On Hold."));
    }
}
