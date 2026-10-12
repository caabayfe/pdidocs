(function executeRule(current, previous /*null when async*/) {
	var dashboardLoader = new SNC.DashboardLoader();
	var dashboardName = current.getDisplayValue('name');
	if (dashboardName)
	  dashboardName = dashboardName.substring(0, 20);
	else
	  dashboardName = "";
	
	dashboardLoader.addTab(current.getUniqueValue(), gs.getMessage('{0} - New Tab', dashboardName));
})(current, previous);
