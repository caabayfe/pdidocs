function onLoad() {
    if (!g_user.hasRole("itil"))
        return;

    var viewName = g_form.getViewName();
    if (viewName == 'sow' || viewName.toLowerCase().startsWith('sow_') || viewName.toLowerCase().startsWith('sow-')) {
        return;
    }

    var label = g_form.getLabel('comments') + ' (' + getMessage('Customer visible') + ')';
    g_form.setLabel('comments', label);
}
