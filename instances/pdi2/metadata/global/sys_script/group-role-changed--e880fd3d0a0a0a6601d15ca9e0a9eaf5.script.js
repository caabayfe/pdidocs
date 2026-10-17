processGroupRoleChange();

function processGroupRoleChange(){
// inherits field changes to true
// - add to all users in the group
// - add to all child groups
// inherits changes to false
// - remove from all users 
// - remove from all groups?
//
var msgArray = new Array();
msgArray.push(current.role.name + "");
msgArray.push(current.group.name + "");
var msg = gs.getMessage("Role: {0}, for group: {1}", msgArray);

gs.addInfoMessage(msg);
gs.include("RoleManager");

var rm = new RoleManager(); 

if (current.inherits.changesTo(true)) {
  rm.addInheritedRoles(current);
} else if (current.inherits.changesTo(false)) {
  rm.deleteInheritedRoles(current);
} else if (current.operation() == 'update' && current.inherits.changesTo(false)) {
  rm.deleteInheritedRoles(current);
} else if (current.operation() == 'delete') {
  rm.deleteAllRoles(current);
}
}
