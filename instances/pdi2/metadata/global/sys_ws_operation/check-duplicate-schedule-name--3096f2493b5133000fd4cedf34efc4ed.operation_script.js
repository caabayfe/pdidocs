(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var param = request.body.data;
    if (JSUtil.notNil(new CloudResourceDiscoveryUtil().getCloudScheduleRecordByName(param.scheduleName, param.scheduleId))) {
		var myError = new sn_ws_err.ServiceError();
		var configSchedule = new CloudDiscoveryScheduleConfig();
		myError.setStatus(418);
		myError.setMessage("Unable to process request");
		myError.setDetail(configSchedule.SCHEDULE_NAME_DUPLICATION_ERR_MSG);
		response.setError(myError);
	} else {
		response.setStatus(200);
	}

})(request, response);
