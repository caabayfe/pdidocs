/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.sysId === '-1' || api.context.props.userPrefs['workspace.showAgentAssist'] != 'true';
}
