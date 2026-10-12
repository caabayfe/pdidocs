/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const showControllerElements = api.state.showControllerSelection;
  if(showControllerElements) {
    return helpers.translateSync("You'll need at least one controller to connect data and scripts to your pages. If your page collection needs data from multiple controllers, include them all. When you're ready to link the data, use the controller's ID to reference it.");
  }

	return helpers.translateSync('The page collection type determines how it is exposed on the page. Once created, the page collection will be available only to the component selected as the type.');
}
