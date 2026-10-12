/**
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var roles = api.context.session.user.roles;
  var result = (!roles) || (roles === null) || (roles.length === 0);
  return result;
}
