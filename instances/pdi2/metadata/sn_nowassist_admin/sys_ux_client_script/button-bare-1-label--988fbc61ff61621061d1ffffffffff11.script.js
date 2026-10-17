/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.dtShowMoreClicked) {
    return helpers.translateSync('See less');
  }
	return helpers.translateSync('See more') + ' (' + (api.data.languages_configured_for_dt.output.length - 16) + ')';
}
