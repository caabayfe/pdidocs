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
    var statusArr = api?.context?.props?.status;
    var activationTimeStamp = api?.context?.props?.t;
    //Display banner only status property changed and StatusArr is not empty
    if (event?.payload?.name === "status" && statusArr) {
        const [status = "", productName = "", timeStamp = ""] = statusArr.split(":");
        switch (status) {
            case 'active':
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "offensiveness_active_success_alert",
                        status: "positive",
                        icon: "circle-check-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Offensiveness for {0} is now active.", productName)
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
                break;
            case 'updated':
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "offensiveness_active_success_alert",
                        status: "positive",
                        icon: "circle-check-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Offensiveness for {0} is now updated.", productName)
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
                break;
            case 'error':
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "offensiveness_active_failure_alert",
                        status: "critical",
                        icon: "circle-exclamation-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Some error occurred while activating Offensiveness for {0}.", productName)
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
                break;
        }
    }
}
