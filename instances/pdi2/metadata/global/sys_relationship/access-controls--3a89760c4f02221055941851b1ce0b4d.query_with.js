(function refineQuery(current, parent) {
    var flowActionName = '';
    flowActionName = parent.sys_scope.scope + '.' + parent.internal_name;

    current.addQuery("name", flowActionName);
    current.addQuery("type", "flow_action");
    current.addQuery("operation", "invoke_from_ai");

})(current, parent);
