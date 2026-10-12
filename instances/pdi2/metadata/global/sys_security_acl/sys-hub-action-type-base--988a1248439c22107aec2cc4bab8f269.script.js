// This check is only for the admin role as the admin role contains all roles when checked by normal means
// this code checks to see if the admin has or has a role that contains the action_write_enabled role.
answer = true;
var user = gs.getUser();
if (!user.hasRole("maint") && user.hasRole("admin") && !user.isXML()){
	answer = user.hasAssignedRole("action_write_enabled");
}
