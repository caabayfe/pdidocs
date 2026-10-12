function onLoad() {
    var colorHelper = new ActionLayoutItemColorHelper();
    colorHelper.loadVariantOptions(g_form.getValue("ux_form_action_layout_item"), g_form.getValue("variant"));
}
