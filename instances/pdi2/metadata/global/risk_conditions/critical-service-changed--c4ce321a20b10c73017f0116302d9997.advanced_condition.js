var stateValue = parseInt(current.getValue('state'));

// State is one of New, Assess or Authorize
if ((stateValue === -5 || stateValue === -4 || stateValue === -3) && current.cmdb_ci.sys_class_name == 'cmdb_ci_service') {
	var serv = new GlideRecord('cmdb_ci_service');
	if (serv.get(current.cmdb_ci) && (serv.busines_criticality == '1 - most critical' || serv.busines_criticality == '2 - somewhat critical'))
		answer = true;
} else
	answer = false;
