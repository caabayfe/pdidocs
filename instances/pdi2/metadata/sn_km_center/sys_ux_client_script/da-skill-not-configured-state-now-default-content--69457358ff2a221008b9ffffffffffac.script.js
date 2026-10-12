/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
  const roles = api.context.session.user.roles || [];
  return (
    roles.includes('sn_nowassist_admin.nsa_admin')
  )
    ? ''
    : helpers.translateSync("Please contact your administrator for access");
}
