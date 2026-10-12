/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
   if(api.state.readerConnectivityResult.data != null && api.state.readerConnectivityResult.data.isError != null && api.state.readerConnectivityResult.data.isError != undefined && api.state.readerConnectivityResult.data.isError)
    return {
        "label": api.state.readerConnectivityResult.data.linkText,
        "href": api.state.readerConnectivityResult.data.link,
        "iconEnd": "open-link-outline",
        "underlined": false,
        "opensWindow": true
    };
    else 
      return '';
}
