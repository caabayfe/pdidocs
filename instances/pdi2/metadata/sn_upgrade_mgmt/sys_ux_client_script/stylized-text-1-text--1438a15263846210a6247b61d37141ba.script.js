/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  if(api.state.isPreviewTableLoading)
	  return helpers.translateSync('Selected Apps - Loading');

  var count = api.state.updatesCount + api.state.newCount;
  return helpers.translateSync('Selected Apps ({0})', count);
    
}
