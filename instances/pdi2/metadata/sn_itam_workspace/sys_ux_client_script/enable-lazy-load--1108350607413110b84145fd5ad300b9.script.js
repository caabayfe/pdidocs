/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var enableLazyLoad = api.data.system_property_check.output;
    const onDemandMetaJson = {
      'asset_count_model_category_btn': ['hideAssetCountByModelCategory', 'hideCardAssetCountByModelCategory'],
      'asset_value_model_category_btn': ['hideAssetValueByModelCategory', 'hideCardAssetValueByModelCategory'],
      'dis_undiscovered_asset_count_btn': ['hideDisUnDiscoveredAssetCount', 'hideCardDisAndUnDiscoveredAssetCount'],
      'asset_eligible_for_refresh_btn': ['hideAssetEligibleforRefresh', 'hideCardAssetEligibleForRefresh']
    };
    api.setState('onDemandMetaJson', onDemandMetaJson);
  
    var status = (enableLazyLoad === true);
    for (var key in onDemandMetaJson) {
        api.setState(onDemandMetaJson[key][0], status);
        api.setState(onDemandMetaJson[key][1], !status);
    }
    api.setState("hideLoaderCardContainer", true);

}
