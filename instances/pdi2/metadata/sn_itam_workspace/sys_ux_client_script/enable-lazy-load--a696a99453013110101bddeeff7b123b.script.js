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
      'asset_lifecycle_by_state_btn': ['hideAssetLifecycleByState', 'hideCardAssetLifecycleByState'],
      'asset_count_by_model_category_btn': ['hideAssetCountByModelCategory', 'hideCardAssetCountByModelCategory'],
      'incomplete_assets_by_model_category_btn': ['hideIncompleteAssets', 'hideCardIncompleteAssets'],
      'spend_by_model_category_btn': ['hideSpendByModelCategory', 'hideCardSpendByModelCategory']
    };
    api.setState('onDemandMetaJson', onDemandMetaJson);
  
    var status = (enableLazyLoad === true);
    for (var key in onDemandMetaJson) {
        api.setState(onDemandMetaJson[key][0], status);
        api.setState(onDemandMetaJson[key][1], !status);
    }
    api.setState("hideLoaderCardContainer", true);
}
