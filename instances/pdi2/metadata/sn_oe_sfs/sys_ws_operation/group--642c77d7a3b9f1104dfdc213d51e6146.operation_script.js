(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = request.body.data;
	var util = new sn_oe_sfs.SidebarParticipantSuggestionsUtils();
	switch (payload.operation) {
		case 'APPLY_GROUP_FILTER':
			result = util.getUserGroups(payload.item);

			response.setContentType("application/json");
			response.setStatus(result.status);
			response.setBody(result.body);
			
			break;
		case 'SAVE_CONFIG':
			result = util.saveConfig(payload.allGroupsFlag, payload.items);

			response.setContentType("application/json");
			response.setStatus(result.status);
			response.setBody(result.body);
			
			break;
	}
})(request, response);
