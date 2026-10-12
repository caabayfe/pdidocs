/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var actions = api?.data?.gform?.nowRecordCommonUiactionbar?.actionNodes;
  if ((api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin")) && actions && actions != '') {
    return false; 
  }
  return true;
}
