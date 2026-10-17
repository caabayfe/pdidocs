/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const addonBaseProductName = api.state.addonBaseProductName;
  const message = helpers.translateSync("To learn more about the product, visit the {0} detail page. Click on the link to discover more about", addonBaseProductName);
  return message;
}
