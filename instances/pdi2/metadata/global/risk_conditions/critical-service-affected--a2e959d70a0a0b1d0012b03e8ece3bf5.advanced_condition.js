var stateValue = parseInt(current.getValue('state'));

// State is one of New, Assess or Authorize
if (stateValue === -5 || stateValue === -4 || stateValue === -3) {
	var ciu = new CIUtils();
	var services = ciu.servicesAffectedByTask(current);

	var critServices = new GlideRecord("cmdb_ci_service");
	critServices.addQuery("sys_id", services);
	critServices.addQuery("busines_criticality", "1 - most critical");
	critServices.query();
	answer = critServices.hasNext(); // return true if critical service affected
} else
	answer = false;
