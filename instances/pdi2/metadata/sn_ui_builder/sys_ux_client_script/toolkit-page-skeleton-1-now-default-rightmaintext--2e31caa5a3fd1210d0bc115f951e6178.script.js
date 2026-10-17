/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const showControllerElements = api.state.showControllerSelection;
  if(showControllerElements) {
    return helpers.translateSync("Why add a controller?");
  }

	return helpers.translateSync('Where does a page collection display?');
}
