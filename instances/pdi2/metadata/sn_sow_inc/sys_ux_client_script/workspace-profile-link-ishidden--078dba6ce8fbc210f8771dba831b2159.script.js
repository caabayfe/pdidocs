/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const applaud_ux_plugin_status = api.data.enabled_plugins_1.output && api.data.enabled_plugins_1.output.length > 0 ?
                                    api.data.enabled_plugins_1.output.find(p => p.id === "sn_applaud_ux") : {};
    const applaud_role = api.data.check_user_role.output && api.data.check_user_role.output["sn_applaud.user"]
    if (applaud_ux_plugin_status.active && applaud_role)
        return false;
    return true;
}
