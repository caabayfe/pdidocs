(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var rotaIds = request.queryParams.rota_id || request.body.data.rotaid;
	var ocrRotaV2 = new OCRotationV2();
	var result = ocrRotaV2.getRostersByRotas(rotaIds);
	if (ocrRotaV2.log.atLevel(GSLog.DEBUG)) {
		ocrRotaV2.timer.timerName += " REST-POST getrostersbyrotas";
		ocrRotaV2.log.debug(ocrRotaV2.timer.result());
	}
	return result;
})(request, response);
