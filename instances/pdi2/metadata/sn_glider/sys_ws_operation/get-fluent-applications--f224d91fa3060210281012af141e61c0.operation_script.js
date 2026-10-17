(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    /**
	 * Retrieves SYS_APP records that are Fluent Apps
	 */
	try {
		var fluentApplications = sn_glider.FluentApplicationList.getApplications();
		// Partially simulating "/api/now/ui/concoursepicker/concourselist"
		response.setBody({
			availableApplications: fluentApplications
		});
		return response.setStatus(200);
	} catch (e) {
		var errorMessage = '[IDE] Failed to retrieve Fluent applications list';
		gs.error(errorMessage, e);
		response.setStatus(500);
		return response.setError(e);
	}

})(request, response);
