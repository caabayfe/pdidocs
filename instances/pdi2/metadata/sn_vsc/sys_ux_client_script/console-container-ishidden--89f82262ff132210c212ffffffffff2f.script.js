/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    // hide access management console and machine identity console for non-admin users
    var console_title = api?.item?.value?.title;
    if (!(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin")) && (console_title == helpers.translateSync('Access management') || console_title == helpers.translateSync('Machine identity'))) {
        return true;
    }
    return false;
}
