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
    let eventName = event.payload.eventPayload.blockcontext.buttonConfig.event;

    switch (eventName) {
        case ("OPR_CONFIGURE_USER_ROLES"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "user-roles",
                        serviceGroup: null,
                        dashboardId: null,
                        dashboardName: null
                    }
                });
                break;
            }
        case ("Configure card button event"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "tabs-and-dashboards",
                        serviceGroup: event.payload.eventPayload.blockcontext.selectedServiceGroup.id,
                        dashboardId: null,
                        dashboardName: null
                    }
                });
                break;
            }
        case ("Advance options card button event"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "dashboard-visualizations",
                        serviceGroup: null,
                        dashboardId:  event.payload.eventPayload.item.parDashboardSysId,
                        dashboardName:  event.payload.eventPayload.item.label
                    }
                });
                break;
            }
    }
}
