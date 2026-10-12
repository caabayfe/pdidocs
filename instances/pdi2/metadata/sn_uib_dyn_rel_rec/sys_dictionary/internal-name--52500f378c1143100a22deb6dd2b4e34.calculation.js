answer = (function() {
                 var scope = current.sys_scope.scope;
                 if (scope.nil())
                       scope = "global";
                 return scope + "." + current.related_record_definition + "." + current.related_record_context;

})()
