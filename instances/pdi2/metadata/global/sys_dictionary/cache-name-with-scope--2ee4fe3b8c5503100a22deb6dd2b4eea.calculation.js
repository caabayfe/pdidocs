(function calculatedFieldValue(current) {

	var scope = current.sys_scope.scope;
    if (scope.nil())
        scope = "global";

    if (!current.name.nil())
        return current.getValue("cache_name") + "." + scope;

    return "";

})(current);
