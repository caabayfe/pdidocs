/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var listOfItems= [];
    listOfItems.push({
        "icon": "home-outline",
        "route_info": "dashboard",
         //"href": "/now/notification-dashboard/dashboard",
        "label": await helpers.translate("Overview")
    });
    if (api.context.props.includePage2 == "true") {
    listOfItems.push({
        "icon": "list-outline",
        "route_info": "view-all",
         //"href": "/now/notification-dashboard/view-all",
        "label": await helpers.translate("Top notifications")
    });
    }
    listOfItems.push({
        "icon": "bell-fill",
        "route_info": "details",
        "label": await helpers.translate("Details")
    });
    api.setState("breadcrumbItems", listOfItems);
}
