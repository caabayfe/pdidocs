var userHasSetupAdminRole = gs.hasRole("sn_help_setup_admin") || gs.hasRole("sn_help_admin");
var userHasCurrentRole = !current.hg_roles || gs.hasRole(current.hg_roles);

if (userHasSetupAdminRole || (gs.hasRole("sn_help_setup_player") && userHasCurrentRole))
    answer = true;
else
    answer = false;
