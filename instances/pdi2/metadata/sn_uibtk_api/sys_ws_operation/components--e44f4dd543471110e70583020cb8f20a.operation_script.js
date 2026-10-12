(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const componentSysIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_IDS,false);
		const componentDefHandler = new ComponentDefinitions();
		let allComponentDefinitions = [];
		let eventDefinitions = [];
		if(componentSysIds){
			allComponentDefinitions = componentDefHandler.getComponentDefinitions(componentSysIds,true);
			const allEventIds = allComponentDefinitions.reduce((acc, {macroponent}) => {
					return acc.concat(macroponent?.handledEvents?.split(',') ?? [], macroponent?.dispatchedEvents?.split(',') ?? [])
				}, []);
			eventDefinitions = new UXEvent().getRecordsByQuery('sys_idIN' + allEventIds, 'name');
		}else{
			allComponentDefinitions = [...componentDefHandler.getToolboxComponents(), ...componentDefHandler.getPseudoComponents()];
		}
		
		apiHelper.getResponse({components: allComponentDefinitions, eventDefinitions}, BuilderToolkitConstants.ERRORS.NO_COMPONENT_DEFINITIONS);
	});

})(request, response);
