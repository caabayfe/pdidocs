/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.projectPermissions?.promin_process_def?.canCreate)
    return helpers.translateSync('You can either create the process configuration or proceed by creating definitions for this project only.');
	
  return helpers.translateSync('You can either contact your Administrator to create the process configuration or proceed by creating definitions for this project only.');
}
