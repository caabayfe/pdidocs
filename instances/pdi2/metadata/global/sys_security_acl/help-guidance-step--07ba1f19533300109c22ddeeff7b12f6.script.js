// Allow users who have 
//   1. either of these roles sn_help_admin, sn_help_setup_admin
//   2. roles mentioned in the the current record
//   3. if no roles are mentioned. ie, the record is meant for all to read
if (gs.hasRole("sn_help_setup_admin, sn_help_admin") || gs.hasRole(current.roles) || !current.roles)
	answer = true;
else
	answer = false;
