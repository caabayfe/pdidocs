doInsertWithRoles();
function doInsertWithRoles() {
  var oldid = current.sys_id.toString();
  var saveMe = current;
  var id = current.setNewGuid();
  var internalRoleId = getInternalRoleSysID();
  var roles = new GlideRecord('sys_security_acl_role');
  roles.addQuery('sys_security_acl',oldid);
  //Do not copy the 'snc_internal' role, it should be auto created, if required
  if (internalRoleId != null)
	  roles.addQuery('sys_user_role', '!=', internalRoleId);
  roles.query();
  while (roles.next()) {
    roles.sys_security_acl = id;
    roles.insert();
  }
  current.insert();
  action.setRedirectURL(saveMe);
}

function getInternalRoleSysID() {
	var roleGR = new GlideRecord('sys_user_role');
	if (roleGR.get('name', 'snc_internal'))
		return roleGR.getValue('sys_id');

	return null;
}
