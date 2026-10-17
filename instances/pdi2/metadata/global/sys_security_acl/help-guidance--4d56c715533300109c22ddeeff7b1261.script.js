// Allow users who have 
//   1. either of these roles sn_help_admin, sn_help_setup_admin
//   2. roles mentioned in the the current record
//   3. if no roles are mentioned. ie, the record is meant for all to read
var userHasGuidanceRole = gs.hasRole("sn_help_setup_admin") ||  gs.hasRole("sn_help_admin");
var userHasCurrentRole = !current.roles || gs.hasRole(current.roles);
if (current.type == "global_setup")
    answer = userHasGuidanceRole || (gs.hasRole("sn_help_setup_player") && userHasCurrentRole);
else
    answer = userHasGuidanceRole || userHasCurrentRole;
