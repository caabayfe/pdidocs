(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var ocrRotaV2 = new OCRotationV2();
	var result = ocrRotaV2.getRostersByRotas(request.pathParams.rota_id);
	if (ocrRotaV2.log.atLevel(GSLog.DEBUG)) {
		ocrRotaV2.timer.timerName += " REST-GET getrostersbyrotas";
		ocrRotaV2.log.debug(ocrRotaV2.timer.result());
	}
	return result;
})(request, response);
