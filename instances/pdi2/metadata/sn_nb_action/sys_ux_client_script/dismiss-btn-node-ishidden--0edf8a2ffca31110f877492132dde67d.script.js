/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.state.customExpProps && (api.state.customExpProps.actionStateValue === 'completed' || api.state.customExpProps.actionStateValue === 'skipped');
}
