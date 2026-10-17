/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var message =  helpers.translateSync('Data displayed from {0} hrs to {1} hrs', api.state.dateJSON.start, api.state.dateJSON.end);
  return message;
}
