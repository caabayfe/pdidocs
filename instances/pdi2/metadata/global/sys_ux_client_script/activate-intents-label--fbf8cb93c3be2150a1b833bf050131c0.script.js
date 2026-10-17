/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.matchingInactiveIntentCount === 0) {
    return helpers.translateSync('View intents');
  }
	return helpers.translateSync('Activate intents');
}
