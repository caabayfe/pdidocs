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
    ? {"label": helpers.translateSync("Activate duplicate articles feature")}
    : {"label": helpers.translateSync("You don’t have permission to access this data")};
}
