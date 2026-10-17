/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api?.context?.props?.table != 'scan_finding'
            || api?.data?.finding_record?.result?.scan_mute_rule?.value
            || !(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"));
}
