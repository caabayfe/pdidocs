/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   return   api.state.hideFailedOOBSkillList? 'chevron-up-outline' : 'chevron-down-outline';
}
