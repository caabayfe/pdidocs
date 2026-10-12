/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.predefinedFilterType && api.state.predefinedFilterType !== '') 
    return [[ api.state.predefinedFilterType ]];
  return [[ 'all' ]];
}
