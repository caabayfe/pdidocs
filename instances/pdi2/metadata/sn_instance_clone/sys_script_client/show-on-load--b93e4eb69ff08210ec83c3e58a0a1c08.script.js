function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord() || g_scratchpad.includeInSystem != "true" || !g_scratchpad.includeInSystem) {
        var msgType = "warning";
        var placeToShow = "table";
        g_form.showFieldMsg(placeToShow, g_scratchpad.preserve_increase_clone_msg, msgType);
        g_form.showFieldMsg(placeToShow, g_scratchpad.preserve_increase_clone_use_conditions_msg, msgType);
    }
}
