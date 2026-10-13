(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var record = request.body.data.contactPreference;
	if(!record)
		return new sn_ws_err.BadRequestError("Record not provided");
	
	return new OnCallContactPreferenceUtil().saveContactPreference(record);

})(request, response);
