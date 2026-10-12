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
    let roles = event.payload.value.map(role => role.label).join(",");
    if (api?.state?.selectedCE?.length > 0 && !!api.context.props.payload.guided_context.ce_roles_mandatory) {
        if (!roles) {
            api.setState("ceUserRolesInvalid", true);
            api.setState("ceUserRolesAlert", [{
                "status": "critical",
                "content": api.context.props.payload.guided_context.translated_text.delivery_user_role_mandatory
            }]);
            api.emit("ACE_ACTION_PERFORMED", {
                eventName: 'SN_NS_ADMIN_DISABLE_NEXT'
            });
        } else {
            api.setState("ceUserRolesInvalid", false);
            api.setState("ceUserRolesAlert", []);
            api.emit("ACE_ACTION_PERFORMED", {
                eventName: 'SN_NS_ADMIN_ENABLE_NEXT'
            });
        }
    }
}
