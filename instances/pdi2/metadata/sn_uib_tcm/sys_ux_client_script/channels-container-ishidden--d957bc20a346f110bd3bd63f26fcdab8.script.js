/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return (!api.state.commTaskDetails || !api.state.commTaskDetails.channels || api.state.commTaskDetails.channels.length == 0);
}
