function onAfter(current, previous) {

	// if the item is related to Operational Manual service, notify impact calculation
	if (current.service_id.operational_status == 1 &&
	   current.service_id.sys_class_name == 'cmdb_ci_service_manual') {

		gs.log("From Business rule on svc_ci_assoc: Triggering impact for " + current.service_id.name);
	
		var im = new SNC.ImpactManager();
		im.triggerImpact(current.service_id);
	}	
}
