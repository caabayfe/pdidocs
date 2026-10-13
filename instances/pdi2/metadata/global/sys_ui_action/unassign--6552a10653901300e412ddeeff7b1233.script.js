function unassignLocation() {
	if ( !CustomEventManager || ( typeof CustomEventManager.fire !== 'function' ) ) 
		return;
	
	var routers = g_list.getChecked();
	CustomEventManager.fireAll('sn_discovery_accelerator.unassign_location', routers);
}
