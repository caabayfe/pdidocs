runUIAction();

function runUIAction() {
	const manager = new SaViewServiceMap();
	const service = manager.getMapUrl(current.sys_id);

	//currently, if having message, then it's only in case of empty business service.
	if (service.message) {
		const uri = action.getGlideURI();
		//If current url is customized application service list wrapper, when make sure it won't refresh: reset the list state.
		//The side effect is that user could've modify the filter before trying to navigate to empty service,
		//and then the filter will be reset again.
		if (uri && uri.toString().indexOf('sa_discovered_services_list.do') !== -1) {
			uri.set('reset_state', 'true');			
			action.setRedirectURL(uri.toString());
		}
		gs.addInfoMessage(service.message);
		return false;
	}

	current.update();
	// show Business Service Map
	action.setReturnURL(current);

	action.setRedirectURL(service.url);
}
