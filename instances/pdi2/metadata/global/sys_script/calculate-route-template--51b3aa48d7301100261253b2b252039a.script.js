updateRoute();

function updateRoute() {
	var routeTemplate = "";
	
	routeTemplate = (current.namespace.toString().length > 0) ? routeTemplate + "/" + current.namespace : routeTemplate;	
	routeTemplate = (current.resource_path.toString().length > 0) ? routeTemplate + current.resource_path : routeTemplate;
	
	var routeRec = new GlideRecord("route");
	routeRec.addActiveQuery();
	routeRec.query();
	while(routeRec.next()) {
		var template = routeRec.getValue("route_template");
		if(routeRec.getUniqueValue() != current.sys_id && SNC.GlideRouteTemplateMatcher.matchTemplates(template, routeTemplate)) {
			current.setAbortAction(true);
			gs.addErrorMessage("Conflicting with existing Route Template. Matching " + template + " for " + routeRec.getValue("service_provider") + " found.");
		}
	}
	current.route_template = routeTemplate;
}
