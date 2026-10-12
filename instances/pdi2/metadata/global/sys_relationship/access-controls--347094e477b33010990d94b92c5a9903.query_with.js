(function refineQuery(current, parent) {
    if (parent.client_callable == true || parent.mobile_callable == true) {
        current.addQuery("name", parent.name);
        current.addQuery("type", "client_callable_script_include");
        current.addQuery("sys_scope", parent.sys_scope);
    }
})(current, parent);
