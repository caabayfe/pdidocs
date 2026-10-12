AddCertificationRoleToManagerOnUserRoleChange();

function AddCertificationRoleToManagerOnUserRoleChange() {

	if (current.role.name == "certification") {
		var manager = current.user.manager;
		if ( manager != "" ) {
           // And the user has the Certification tole
           if (current.operation() === 'insert') {
              // But none of the user underlings has the role
              var subor = new GlideRecord('sys_user_has_role');
              subor.addQuery('role', current.role);
              subor.addQuery('user.manager', current.user);
              subor.query();
              if (!subor.hasNext()) {
                 // Then check & add role to manager
                 if (!checkRole(manager, current.role)) {
                    var newRole = new GlideRecord('sys_user_has_role');
                    newRole.user = manager;
                    newRole.role = current.role;
                    newRole.setWorkflow(false);
                    newRole.insert();
                    newRole.setWorkflow(true);
                 }
              }
           }
        }
     }
}

function checkRole(user, role) {
   var hasRole = new GlideRecord('sys_user_has_role');
   hasRole.addQuery('user', user);
   hasRole.addQuery('role', role);
   hasRole.query();
   return (hasRole.next());
}
