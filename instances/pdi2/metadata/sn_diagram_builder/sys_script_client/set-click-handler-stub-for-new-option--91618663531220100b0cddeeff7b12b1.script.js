function onLoad() {
    var clickHandler = "function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {\n\t//Add code for click of this context menu option\n}";
    if (g_form.isNewRecord())
        g_form.setValue("script", clickHandler);

}
