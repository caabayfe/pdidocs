/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const addonBaseProductSysId = api.state.addonBaseProductSysId;
  const addonBaseProductName = api.state.addonBaseProductName;
  const label = helpers.translateSync('{0}.', addonBaseProductName);
  const href = "/now/subscription/subscription-details/" + addonBaseProductSysId + "/regularuser";
  const linkObj = {"label": label,
    "href": href,
    "opensWindow":false};
	return linkObj;
}
