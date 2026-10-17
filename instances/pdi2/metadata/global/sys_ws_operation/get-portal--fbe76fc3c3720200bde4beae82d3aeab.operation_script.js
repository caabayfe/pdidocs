function getPortalPreferences(portal_section) {
	var id;
	var gr = new GlideRecord('sys_portal_preferences');
	gr.addQuery('portal_section',portal_section);
	gr.query();
	var prefs = {};
	prefs ["portal_section"] = portal_section;
	while(gr.next()) {
		var key = gr.getValue("name");
		var valForKey = gr.getValue("value");
		prefs[key] = valForKey;
		if(gr.getValue('name') === 'renderer')
			id =gr.getValue('name');
	}

	return {"id": id,"prefs":prefs};
}

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    //Get Data from sys_portal
	var gr = new GlideRecord('sys_portal');
	gr.addQuery('page','c6336292eb830100d4360c505206fe36');
	gr.query();
	var portal_data = [];
	while(gr.next()){
		var preference = getPortalPreferences(gr.getValue('sys_id'));
		preference["grid_config"]= gr.getValue("grid_config");
		portal_data.push(preference);
	}

	return  portal_data;

})(request, response);
