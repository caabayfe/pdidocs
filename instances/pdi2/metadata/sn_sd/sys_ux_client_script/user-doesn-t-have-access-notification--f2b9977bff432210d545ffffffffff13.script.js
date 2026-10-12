/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!(api.context.session.user.roles.includes('admin') || (api.context.session.user.roles.includes('sn_sd.success_dashboard_admin') && api.data.get_user_access_on_sys_user_has_role_1.output.canCreate)))
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "accessAlert",
                status: "warning",
                icon: "check-circle-outline",
                content: "You do not have the required access to perform this action. Please contact the system administrator.",
                action: {
                    type: "dismiss"
                },
            }]
        });

}
