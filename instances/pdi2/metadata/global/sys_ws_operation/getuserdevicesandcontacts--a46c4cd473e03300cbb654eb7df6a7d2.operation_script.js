(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	return new OnCallUserPreferences().getUserDevicesAndContacts(gs.getUserID());
})(request, response);
