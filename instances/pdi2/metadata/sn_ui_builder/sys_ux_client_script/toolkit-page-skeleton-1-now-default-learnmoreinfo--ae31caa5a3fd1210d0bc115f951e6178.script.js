/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  
  const controllerLearnMore = helpers.translateSync("Learn more about controllers");
  const pcLearnMore = helpers.translateSync("Learn more about page collections");

  if (api.state.showControllerSelection) {
    return {"label":controllerLearnMore, "url":"/api/now/v1/context_doc_url/uib_controllers"};
  }
  else {
    return {"label":pcLearnMore, "url":"/api/now/v1/context_doc_url/uib_page_collection"};
  }
}
