auditRoleChange();

function auditRoleChange() {
   if (GlideProperties.getBoolean('glide.role_management.use.inh_count', true) && pm.isActive('com.glide.role_management.inh_count'))
	   return;
	
   var auditRole = new GlideRecord("sys_audit_role");
   if (!auditRole.isValid())
      return;

   auditRole.user = current.user;
   auditRole.role = current.role;
   auditRole.changed_by = gs.getUserID();
   auditRole.granted_by_group = current.granted_by;
   switch (current.operation()) {
      case "update":
         auditRole.operation = "Updated";
         break;
      case "delete":
         auditRole.operation = "Removed";
         break;
      default: // it's an insert
         auditRole.operation = "Added";
   }
   auditRole.count_after_change = countInstances();
   auditRole.insert();
}

function countInstances() {
   var count = new GlideAggregate("sys_user_has_role");
   count.addQuery("user", current.user);
   count.addQuery("role", current.role);
   count.addAggregate("COUNT");
   count.query();
   var instances = 0;
   if (count.next()) 
      instances = count.getAggregate('COUNT');
   return instances;   
}
