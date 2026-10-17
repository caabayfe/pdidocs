/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
  if(api.state.senderConnectivityResult.data != null && api.state.senderConnectivityResult.data.isError != null && api.state.senderConnectivityResult.data.isError)
    return {
        "label": api.state.senderConnectivityResult.data.linkText,
        "href": api.state.senderConnectivityResult.data.link,
        "iconEnd": "open-link-outline",
        "underlined": false,
        "opensWindow": true
    };
    else 
      return '';
}
