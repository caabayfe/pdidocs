/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var roles = api.context.session.user.roles;
  if (roles.includes('sn_nowassist_admin.nsa_admin')) {
    return [{"label": helpers.translateSync("Activate feature"), "variant": "primary"}];
  }
  return '';
}
