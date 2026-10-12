/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin")) || api?.context?.props?.payload?.props_details?.is_non_overridable) {
        return true;
    }

    if (api?.context?.props?.payload?.props_details?.recommended_description?.toLowerCase().includes('security_admin')) {
        if(api?.context?.session?.user?.roles?.includes('security_admin')){
            return false;
        }
        return true;
    }
    return false;
}
