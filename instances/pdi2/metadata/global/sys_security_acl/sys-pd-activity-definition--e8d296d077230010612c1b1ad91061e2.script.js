var requiredRoles = current.getValue('required_roles');
var requiredRolesList = requiredRoles ? requiredRoles.split(',') : [];
var needsRequiredRole = requiredRolesList.length > 0;
var userRoles = gs.getUser().getRoles() || [];
var hasRequiredRole = false;
for (var i = 0; i < requiredRolesList.length; i++) {
    var role = requiredRolesList[i];
    if (userRoles.indexOf(role) >= 0) {
        hasRequiredRole = true;
        break;
    }
}
var meetsActRequiredRole = !needsRequiredRole || (needsRequiredRole && hasRequiredRole);

var meetsAllRoleChecks = meetsActRequiredRole && (new FlowDesignerContentFiltering()).canRead(current);
var isCreatedByCurrentUser = gs.getUserName() === current.getValue('sys_created_by');

answer = meetsAllRoleChecks || isCreatedByCurrentUser;
