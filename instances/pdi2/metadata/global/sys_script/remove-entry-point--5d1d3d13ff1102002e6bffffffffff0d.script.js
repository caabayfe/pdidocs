(function executeRule(current, previous /*undefined when async or display*/) {

	var bsManager = new SNC.BusinessServiceManager();
	bsManager.convertConnectedEndpointsToBoundary(current.cmdb_ci_endpoint, current.cmdb_ci_service);
	
	// Removing entry point from the Service Model
	var smManager = new SNC.ServiceModelingIntegrationManager();
	smManager.removeEntryPoint(current.cmdb_ci_service, current.cmdb_ci_endpoint);
	
	//if last entry point removed, turn BS to non-operational

	var serviceId = current.cmdb_ci_service;
	var nDeleted = current.getRowCount();
	var gr;

	gs.debug('Remove EP:: serviceId = ' + serviceId);

	gr = new GlideRecord('sa_m2m_service_entry_point');
    gr.addQuery('cmdb_ci_service', serviceId);
    gr.query();

	var nTotal = gr.getRowCount();

	//check that all entry points are being removed
	if (nDeleted !== nTotal)
		return;

	gr = new GlideRecord('cmdb_ci_service_discovered');
    gr.addQuery('sys_id', serviceId);
    gr.query();

	if (gr.next()) {
		// If the operational status is "Operational" (1), change it to "Non-Operational" (2)
		if (gr.getValue('operational_status') == 1) {
			gr.operational_status = 2;
			gr.update();
			gs.addInfoMessage(gs.getMessage("All entry points deleted, service status changed to Non-Operational."));
		}
	}

})(current, typeof previous != 'undefined' ?  previous : null);
