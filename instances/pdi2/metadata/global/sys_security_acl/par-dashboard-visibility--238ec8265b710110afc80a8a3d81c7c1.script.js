var dashboard = current.getValue('dashboard');
if (dashboard == '')
	answer = false;
else 
	answer = SNC.DashboardACLUtilScriptable.canDeleteDashboard(current.getValue('dashboard'));
