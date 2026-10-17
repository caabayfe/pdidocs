
      /**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    return !(api.context.session.user.roles.includes('oauth_admin'));
}
