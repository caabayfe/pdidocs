var alerts = [];
alerts.push(current.sys_id);
if (current.parent != null && current.parent != "")
	alerts.push(current.parent);

var alertManager = new SNC.AlertManager();
alertManager.calculateAlertPriorityOnDemand(alerts);

action.setRedirectURL(current);
