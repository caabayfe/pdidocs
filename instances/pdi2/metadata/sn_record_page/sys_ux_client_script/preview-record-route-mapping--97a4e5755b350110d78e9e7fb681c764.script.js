/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {imports} params.imports
* @param {helpers} params.helpers
*/
function previewRecordRouteMapping({
	api,
	helpers,
	event,
	imports
}) {
	// Bypass dynamic routing for non "record" pages
	if (event.payload.route && event.payload.route !== 'record') {
		api.emit('NAV_ITEM_SELECTED', event.payload);
		return;
	}

	const {
		routeMapping,
		buildDefaultRoutePayload
	} = imports["global.recordRoutesMapping"]();
	
	var featureRoutes;
	if(api.context.app.featureRoutes)
		featureRoutes  = JSON.parse(api.context.app.featureRoutes);
	var route = featureRoutes?.record?._form?.routeInfo?.route || 'record';
	var targetRoute = 'current';
	const domainId = api.data.glide_form_1?.nowRecordFormBlob?.domainSeparation?.domainId || '';

	const routeMappingPaylod = event => {
		const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event, domainId);
		// Pass view of parent record to reference field record via URL parameter
		if (defaultRoutePayload?.params)
			defaultRoutePayload.params.sysparmView = api.data.glide_form_1?.nowRecordFormBlob?.detailsProps?.view;

		const routeMap = api.data.dynamic_routing_record.routeMap;
		return routeMapping(routeMap, defaultRoutePayload, event, domainId);
	};

	// 1. event.elementId === 'form';              	// when event comes from 'Form Controller reference Info Click' sys_ux_addon_event_mapping
	// 2. event.elementId === 'open_record_button';	// when event mapped from popover open record button's NOW_BUTTON#CLICKED event
	// 3. event.elementId === 'record';            	// when event dispatched by MACROPONENT_POPOVER_ERROR_OCCURRED's sys_ux_client_script
	// 'Preview Record Popover Route Mapping' sys_ux_client_script copies the original event.elementId to state.popoverNavigation.payload.sourceEventElementId
	// For routeMapping() to map the event emitted by 2 & 3 to the same route as 1, we need to overwrite event.elementId with payload.sourceEventElementId
	const elementId = event.payload?.sourceEventElementId || event.elementId;
	const payload = routeMappingPaylod(Object.assign({}, event, { elementId: elementId }));

	// If a table name passed into trueupTable matches the existing table
	// refresh trueup DR to get real table name; otherwise use existing.
	if (api.state.routeParentTables && api.state.routeParentTables.split(',').find(table => table === payload.fields.table)) {
		// This refreshes data.resolve_route_parent_tables
		api.setState('navigationPayload', payload);
	} else { 
		api.emit('NAV_ITEM_SELECTED', payload); 
	} 
}
