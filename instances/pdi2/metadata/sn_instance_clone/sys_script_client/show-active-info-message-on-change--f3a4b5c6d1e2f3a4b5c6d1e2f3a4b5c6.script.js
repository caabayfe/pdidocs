function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var infoMsgType = "info";
    var activeField = "active";
    g_form.showFieldMsg(activeField, g_scratchpad.cleanup_script_active_info, infoMsgType);
}
