answer = (function() {
 var scope = current.sys_scope.scope;
 if (scope.nil())
  scope = "global";

  if (!current.name.nil())
   return scope + "." + current.name;

    return "";
})()
