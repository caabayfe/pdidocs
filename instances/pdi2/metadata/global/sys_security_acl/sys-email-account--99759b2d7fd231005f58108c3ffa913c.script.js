// If configured by default system is enabled, then only maintenance
// users can update these fields, otherwise admins may
if (current.servicenow_configured)
	answer = gs.hasRole("maint");
else
	answer = gs.hasRole("email_account_admin");
