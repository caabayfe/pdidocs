addCertificationRoleToManager();

function addCertificationRoleToManager() {
   //Get sys_id for the certification role
   var certificationRole = new GlideRecord("sys_user_role");
   // If Certification role exists
   if (certificationRole.get("name", "certification")) {
      // And the user has the Certification tole
      if (checkRole(current.sys_id, certificationRole.sys_id)) {
         // But none of the user underlings has the role
         var subor = new GlideRecord('sys_user_has_role');
         subor.addQuery('role', certificationRole.sys_id);
         subor.addQuery('user.manager', current.sys_id);
         subor.query();
         if (!subor.hasNext()) {
            // Then check & add role to manager
            if (!checkRole(current.manager, certificationRole.sys_id)) {
               var newRole = new GlideRecord('sys_user_has_role');
               newRole.user = current.manager;
               newRole.role = certificationRole.sys_id;
               newRole.setWorkflow(false);
               newRole.insert();
               newRole.setWorkflow(true);
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
