(function process(request, response) {
	var userId = request.pathParams.userId;
	
	UserCheck.verifyLoggedIn(userId);

	response.setBody({
		user: gs.getUserID(),
		prefs: UserPreferences.get(userId)
	});
	response.setStatus(200);
	response.setContentType('application/json');

})(request, response);
