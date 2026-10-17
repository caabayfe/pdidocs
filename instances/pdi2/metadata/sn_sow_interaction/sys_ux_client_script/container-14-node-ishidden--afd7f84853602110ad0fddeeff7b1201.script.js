/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.fetch_asset_information.output && api.data.fetch_asset_information.output.numberOfAssets > 0 && api.state.assetsHeader)
    return false; 
  else 
    return true;
}
