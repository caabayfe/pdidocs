function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord() || g_scratchpad.includeInSystem != "true" || !g_scratchpad.includeInSystem) {
        var msgType = "warning";
        var fieldName = "name";
        g_form.showFieldMsg(fieldName, g_scratchpad.cleanup_script_error_handling_warning, msgType);
    }
    var infoMsgType = "info";
    var activeField = "active";
    var orderField = "order";
    g_form.showFieldMsg(activeField, g_scratchpad.cleanup_script_active_info, infoMsgType);
    g_form.showFieldMsg(orderField, g_scratchpad.cleanup_script_order_info, infoMsgType);
}
