/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("Are you sure you want to move {0}?", api.state.currentEventMove.event?.title || "event");
}
