/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var text1 = helpers.translateSync("By activating this notification, you'll start receiving emails from this instance.");
  var text2 = helpers.translateSync("Confirm your choice to activate or cancel this action.");
  var translatedText = text1+'<br>'+text2;
	return translatedText;
}
