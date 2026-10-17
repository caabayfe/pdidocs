/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var throughputRate = api.state.throughputRate;
  throughputRate = Number(Math.round((throughputRate/360)  + "e+2") + "e-2");
	return throughputRate;
}
