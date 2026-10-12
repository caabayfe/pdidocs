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

    let selectedServiceGroup = api.state.blockcontext.selectedServiceGroup[0];
    let handeledEvents = ["ADVANCE_BUTTON#CLICKED", "SINGLE_SCORE_BUTTON#CLICKED"];
    let aceEventName = event.payload.eventName;
    if(!handeledEvents.includes(aceEventName)) return;
    
    let eventName = event.payload.eventPayload.blockcontext.buttonConfig.config;

    switch (eventName) {
        case ("SD_CONFIGURE_USER_ROLES"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "user-roles",
                        serviceGroup: null
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_KB_DEFLECTION"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "deflection-configuration-kb",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_VA_DEFLECTION"):
            {
                if (selectedServiceGroup == "0a7f1437533011101d87ddeeff7b12da") { //IT 
                    api.emit("CONTENT_UPDATED", {
                        params: {
                            route: "deflection-configuration-va",
                            serviceGroup: selectedServiceGroup
                        }
                    });
                } else if (selectedServiceGroup == "b21e662bc3741110daf3eeb0d840dd24") { //HR
                    api.emit("CONTENT_UPDATED", {
                        params: {
                            route: "va-form",
                            serviceGroup: selectedServiceGroup
                        }
                    });
                }
                break;
            }
        case ("SD_CONFIGURE_CATALOG_ITEM_FULFILMENT_LEVEL"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "fulfilment-automation-level",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_PA_JOBS"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "pa-jobs-list",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_PROCESS_MINING"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "process-mining-projects",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_SYS_PROP"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "sys-property-config",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
        case ("SD_CONFIGURE_KPI"):
            {
                api.emit("CONTENT_UPDATED", {
                    params: {
                        route: "kpi-details",
                        serviceGroup: selectedServiceGroup
                    }
                });
                break;
            }
    }
}
