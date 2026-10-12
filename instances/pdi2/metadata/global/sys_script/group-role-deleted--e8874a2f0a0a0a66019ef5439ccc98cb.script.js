// delete this role from all users that had it granted by the group
// delete this role from all child groups that had it 
// granted by this group
gs.include("RoleManager"); 
var rm = new RoleManager(); 
rm.deleteInheritedFromGroups(current);
