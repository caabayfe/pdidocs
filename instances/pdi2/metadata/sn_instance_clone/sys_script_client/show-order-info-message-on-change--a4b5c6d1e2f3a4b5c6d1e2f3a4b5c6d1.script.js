function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var infoMsgType = "info";
    var orderField = "order";
    g_form.showFieldMsg(orderField, g_scratchpad.cleanup_script_order_info, infoMsgType);
}
