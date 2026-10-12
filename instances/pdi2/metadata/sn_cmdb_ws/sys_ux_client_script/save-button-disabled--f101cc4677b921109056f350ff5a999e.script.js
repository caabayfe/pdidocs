/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.data.ms_allow_query_edit.output || api.state.dataActivity || !api.state.saveable || !api.state.isDirty) {
    return true;
  }
      
  return false;

}
