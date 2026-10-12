function transform(input) {
    var list = input.concoursepickerData.result.list;
    var currentScope = input.concoursepickerData.result.current || "global";
    var scopes = list.map(function(scope) {
        var scopeObj = scope;
        scopeObj.id = scope.sysId;
        scopeObj.label = scope.name;
        return scopeObj;
    });
    var userScope = scopes.filter(function(s) {
        return s.id === currentScope;
    });

    return {
        allScopes: scopes,
        scope: userScope.length ? userScope[0] : {},
    };
}
