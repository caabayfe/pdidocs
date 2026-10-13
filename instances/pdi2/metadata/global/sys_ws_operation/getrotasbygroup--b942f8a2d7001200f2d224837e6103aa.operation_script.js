(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var ocrRotaV2 = new OCRotationV2();
	var result = ocrRotaV2.getRotasByGroup(request.pathParams.group_ids);
	if (ocrRotaV2.log.atLevel(GSLog.DEBUG)) {
		ocrRotaV2.timer.timerName += " REST-GET getrotasbygroup";
		ocrRotaV2.log.debug(ocrRotaV2.timer.result());
	}
	return result;
})(request, response);
