runUIAction();

function runUIAction() {
	var sysId = current.sys_id;
	
	var manager = new SaViewServiceMap();
	var serviceId = manager.getServiceIdFromSaCountersId(sysId);
	
	if (!serviceId) {
		gs.addInfoMessage(gs.getMessage("Invalid id {0} : no related service sys_id", [sysId]));
		return; 
	}
	
	//URL for service mapping home screen - to open directly into single service form for a given service id.
	var url;
	var useLegacyView = gs.getProperty('service.watch.use.legacy.view', 'false') === "true";	
	if(useLegacyView)
		url = "cmdb_ci_service_discovered.do?sys_id=" + serviceId;		
	else
		url = "$sa_service_maps_management_container.do?view=singleBs&sysId=" + serviceId;
		
	
	action.setRedirectURL(url);
}
