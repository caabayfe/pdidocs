/**
 * @param {params} params  
 * @param {api} params.api  
 * @param {TransformApiHelpers} params.helpers  
 */
function evaluateProperty({
    api,
    helpers,
}) {
  const {
        preferences,
        ...userMeta
    } = api.context.session.user;
    userMeta.sessionLoggedIn = api.context.session.isLoggedIn;
    return userMeta;
}
