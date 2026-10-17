(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var user = gs.getUser();
  var userName = user.getName();
  var userId = user.getID();
  var userRoles = user.getUserRoles();
  var isAdmin = user.hasRole('admin');
  var isMaint = user.hasRole('maint');
  var delegatedScopes = ['global'];

  var session = gs.getSession();
  var timeZone = session.getTimeZoneName();

  userRoles.forEach(function(roleName) {
    var grr = new GlideRecord('sys_user_role');
    grr.get('name', roleName);
    var roleSysId = grr.getUniqueValue();

    var gr = new GlideRecord('sys_scope_permission_set_role_assignment');
    gr.addQuery('role', roleSysId);
    gr.query();
    while (gr.next()) {
      var scope = gr.getValue('scope');
      if (delegatedScopes.indexOf(scope)==-1) delegatedScopes.push(scope);
    }
  });

  return {
    userId: userId,
    userName: userName,
    isAdmin: isAdmin,
    isMaint: isMaint,
    delegatedScopes: delegatedScopes,
    timeZone: timeZone,
  };
})(request, response);
