(function refineQuery(current, parent) {
    var uiPageName = '';
    if (parent.sys_scope == 'global') {
        uiPageName = parent.name;
    } else {
        uiPageName = parent.sys_scope.scope + '_' + parent.name;
    }
    current.addQuery("name", uiPageName);
    current.addQuery("type", "ui_page");
    current.addQuery("operation", "read");
})(current, parent);
