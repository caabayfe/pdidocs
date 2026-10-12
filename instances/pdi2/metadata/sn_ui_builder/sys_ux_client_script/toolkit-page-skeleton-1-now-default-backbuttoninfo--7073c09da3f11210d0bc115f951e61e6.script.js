/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

	return api.state.showControllerSelection ? {
    backButtonId: "back-to-page-collection",
    backButtonLabel: helpers.translateSync("Back to page collection details"),
    } : null;
}
