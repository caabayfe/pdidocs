/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function script({ api, helpers }) {
    const { firstName, lastName, language } = api.context.session.user || {};
     
     // Default to a generic greeting if first name or last name is missing
    if (!firstName || !lastName ) {
        return helpers.translateSync('Welcome to Admin Home!');
    } 

       // Use last name for chinese & japnese else firstname for any other.
       const name = ['ja', 'ja-jp', 'zh', 'zh-cn', 'zh-hk'].includes(language) ? lastName : firstName;
      return helpers.translateSync('Welcome to Admin Home, {0}!', name);

 
    
}
