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
    api.emit("NAV_ITEM_SELECTED", {
        route: "pages",
        params: {
            filter: api.context.props.filter,
            listEncodedQuery: api?.context?.props?.listEncodedQuery,
            library: "data-visualizations"
        }
    });

    var roles = api.context &&
        api.context.session &&
        api.context.session.user &&
        api.context.session.user.roles || [];

    var ADMIN_ROLES = [
        "admin",
        "platform_analytics_admin",
        "viz_admin",
        "pa_admin",
        "report_admin"
    ];

    var isAdmin = roles.some(role => ADMIN_ROLES.includes(role));

    if (isAdmin) {
        api.setState("tourId", "672eb0a2ff28721065f1ffffffffffce");
        api.setState("userId", api.context.session.user.sys_id);
    }
}
