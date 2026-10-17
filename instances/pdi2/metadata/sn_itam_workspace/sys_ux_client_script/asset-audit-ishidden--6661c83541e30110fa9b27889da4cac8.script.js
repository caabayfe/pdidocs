/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var isHampActive = api.data.hamp_plugin_status.output.active;
  if (isHampActive) {
    if (api.state.hideNewAssetBtn) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}
