function onDisplay(current, g_scratchpad) {
	//Attach the info message to the scratchpad and then add to the form to be able to remove for resource path cors.
	var infoMsgs = {};
	infoMsgs.rest_api = gs.getMessage("CORS Description");
	infoMsgs.resource_path = gs.getMessage("Configure CORS rules to allow cross domain requests to a resource path from a browser based application in a different domain.");
	g_scratchpad["cors_info_message"] = infoMsgs;
}
