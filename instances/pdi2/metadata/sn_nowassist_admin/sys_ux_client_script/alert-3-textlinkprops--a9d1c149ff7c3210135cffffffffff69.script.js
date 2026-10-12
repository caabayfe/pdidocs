/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "label": helpers.translateSync("Review configuration"),
        "href": "/sys_agent_access_role_configuration.do?sys_id=" + api.context?.props?.payload?.guided_context?.roleMaskingData?.response[0]?.sysId,
        "iconEnd": "open-link-right-outline",
        "underlined": true
    };
}
