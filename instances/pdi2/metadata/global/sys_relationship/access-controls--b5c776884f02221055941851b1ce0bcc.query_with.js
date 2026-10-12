(function refineQuery(current, parent) {
    var flowName = '';
    flowName = parent.sys_scope.scope + '.' + parent.internal_name;

    current.addQuery("name", flowName);
    current.addQuery("type", "flow");
    current.addQuery("operation", "invoke_from_ai");

})(current, parent);
