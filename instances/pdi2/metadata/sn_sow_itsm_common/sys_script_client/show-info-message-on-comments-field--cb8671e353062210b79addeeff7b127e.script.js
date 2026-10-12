function onLoad() {
    var viewName = g_form.getViewName();
    if (viewName == 'sow' || viewName.toLowerCase().startsWith('sow_') || viewName.toLowerCase().startsWith('sow-')) {
        var message = getMessage('Everyone can see this comment');
        g_form.showFieldMsg('comments', message, 'info');
    }
}
