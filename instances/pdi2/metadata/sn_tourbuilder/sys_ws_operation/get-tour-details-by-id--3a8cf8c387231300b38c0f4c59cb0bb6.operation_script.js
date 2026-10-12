(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	if (!request.pathParams.id) response.setStatus(400);
	else {
		var detail = request.queryParams['detail'] ?request.queryParams['detail'].toString(): "low";
		var controller = new sn_tourbuilder.GTAutoLaunchController();
		/*  On the player side, we can't always find the gwtMessage object, especially on Workspace pages.
		    Due to this, we rely on the backend to get translations if the current session language is other than English, for all strings that are used on the player side
		*/
        	var session = gs.getSession();
    		var language = session.getLanguage();
    		var i18n = (language=="en")?false:true;
		var result = controller.getTourById(request.pathParams.id, detail,i18n);
		if (result.success) {
			response.setBody(result.payload);
			response.setStatus(200);
		} else {
			response.setStatus(404);
		}
	}	

})(request, response);
