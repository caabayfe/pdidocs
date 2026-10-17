/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var importantActionCount = api.state.importantActions.length;
  if (importantActionCount === 1)
	  return helpers.translateSync("{0} important action", importantActionCount);
  return helpers.translateSync("{0} important actions", importantActionCount);
}
