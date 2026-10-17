(function process(request, response) {
	var userId = request.pathParams.userId;
	
	UserCheck.verifyLoggedIn(userId);

	response.setBody({
		user: userId,
		result: UserPreferences.set(userId, request.body.data)
	});
	response.setStatus(200);
	response.setContentType('application/json');

})(request, response);
