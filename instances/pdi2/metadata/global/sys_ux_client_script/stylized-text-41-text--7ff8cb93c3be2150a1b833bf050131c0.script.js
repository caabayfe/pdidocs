/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.unmappedIntentsCount === 0) {
    return helpers.translateSync('You are good to go!');
  }
	return helpers.translateSync('Map additional intents to increase coverage');
}
