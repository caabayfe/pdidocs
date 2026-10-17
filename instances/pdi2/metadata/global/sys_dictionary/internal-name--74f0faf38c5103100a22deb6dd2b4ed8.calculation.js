answer = (function() {
 var scope = current.sys_scope.scope;
 if (scope.nil())
  scope = "global";

  if (!current.capability.nil() && !current.capability_type.nil())
   return scope + "." + current.capability + "." + current.capability_type;

    return "";
})();
