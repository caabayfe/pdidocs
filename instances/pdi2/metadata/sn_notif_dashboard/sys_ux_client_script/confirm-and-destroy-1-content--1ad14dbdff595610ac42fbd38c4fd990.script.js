/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var text1 = helpers.translateSync("Deactivating this notification will stop any future emails from being sent for this notification from this instance.");
  var text2 = helpers.translateSync("Would you like to proceed?");
  var translatedText = text1+'<br>'+text2;
	return translatedText;
}
