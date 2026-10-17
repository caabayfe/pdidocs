(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupIds = request.queryParams.groupid || request.body.data.groupid;
	var ocrRotaV2 = new OCRotationV2();
	var result = ocrRotaV2.getRotasByGroup(groupIds);
	if (ocrRotaV2.log.atLevel(GSLog.DEBUG)) {
		ocrRotaV2.timer.timerName += " REST-POST getrotasbygroup";
		ocrRotaV2.log.debug(ocrRotaV2.timer.result());
	}
	return result;
})(request, response);
