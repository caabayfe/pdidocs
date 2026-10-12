answer = (function() {
                 var scope = current.sys_scope.scope;
                 if (scope.nil())
                       scope = "global";

                   return scope + "." + current.display_label;

})()
