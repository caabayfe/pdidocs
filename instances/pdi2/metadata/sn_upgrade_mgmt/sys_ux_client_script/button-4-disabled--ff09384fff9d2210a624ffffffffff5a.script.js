/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.updatesCount != null && api.state.newCount != null && (api.state.updatesCount + api.state.newCount === 0))
    return false;
	return !api.state.isProcessingClicked || api.state.isProcessing || api.state.tableIsDirty;
}
