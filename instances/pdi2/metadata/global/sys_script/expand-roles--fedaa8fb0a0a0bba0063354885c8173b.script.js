gs.include("RoleManager");
var rm = new RoleManager();
if (sys_action == 'update') {
   // should never happen
} else if (sys_action == 'delete') {
   rm.deleteRole(current);
} else if (sys_action == 'insert') {
   rm.expandRole(current);
} 
