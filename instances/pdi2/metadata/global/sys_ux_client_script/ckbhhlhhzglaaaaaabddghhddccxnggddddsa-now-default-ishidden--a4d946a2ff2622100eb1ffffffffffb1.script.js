function evaluateProperty({api}) {
	var reqForDetails = api.data.g_form.requestedForDetails;
	if(reqForDetails && Object.keys(reqForDetails).length > 0)
		return !reqForDetails.visible;
	return true;
}
