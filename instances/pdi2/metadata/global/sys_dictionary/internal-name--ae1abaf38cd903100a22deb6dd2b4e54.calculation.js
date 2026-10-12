answer = (function() {
 var scope = current.sys_scope.scope;
 if (scope.nil())
  scope = "global";

  if ((!current.context.nil()) && (!current.mfa_factor.nil()) && (!current.policy.nil()))
   return scope + "." + current.context + "." + current.mfa_factor + "." + current.policy;

    return "";
})();
