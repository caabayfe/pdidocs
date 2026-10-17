/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.matchingInactiveIntentCount === 0) {
    return helpers.translateSync('You are good to go!');
  }
	return helpers.translateSync('Activate intents to increase coverage');
}
