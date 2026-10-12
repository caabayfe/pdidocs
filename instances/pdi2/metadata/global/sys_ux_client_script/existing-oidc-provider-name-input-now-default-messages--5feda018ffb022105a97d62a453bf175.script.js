/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const alertmsg = [];
  if(api.state.disableEditOIDCRecord==false)
    alertmsg.push({
      "content": api.state.translatedMessaged.editingOIDCProviderConfig,
      "status": "suggestion",
      "icon": "lightbulb-outline"
    });
	return alertmsg;
}
