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
    /*
    This will set the optional parameter values of group count and user count in the url.
    These values will be used in the banner notification to be displayed when groups are allocated
    to subscription from the allocate groups page
    */
    const status = api.context.props.allocate.toLowerCase();
    const sysId = api.context.props.sysId;
    const showmod = api.context.props.showmod;
    const category = 'regularuser';
    //show notifications if not showing add groups modal
    if (!showmod) {
        switch (status) {
            case 'success':
                const groupCount = api.context.props.gc;
                const userCount = api.context.props.uc;

                if (groupCount != undefined && userCount != undefined) {
                    helpers.translate('You added {0} groups, allocating {1} subscriptions.', groupCount, userCount)
                    .then((text) => {
                          api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "allocatedSuccessAlert",
                            status: "positive",
                            icon: "circle-check-outline",
                            "content": {
                                "type": "html",
                                "value": text
                            },
                            action: {
                                type: "dismiss"
                            },
                        }]
                    });
                    });
                }
                break;
            case 'over':
                const overUserCount = api.context.props.tc;
                const gc = api.context.props.gc;
                const uc = api.context.props.uc;
                const availableCount = api.data.sub_ent_record.result.purchased_count.displayValue;
                if (gc != undefined && uc != undefined) {
                    helpers.translate('You added {0} groups, allocating {1} subscriptions.',gc, uc)
                    .then((text) => {
api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "allocatedSuccessAlert",
                            status: "positive",
                            icon: "circle-check-outline",
                            "content": {
                                "type": "html",
                                "value": text,
                            },
                            action: {
                                type: "dismiss"
                            },
                        }]
                    });
                    });
                }



                if (availableCount != undefined && overUserCount != undefined) {
                    helpers.translate('You purchased {0} subscriptions but allocated {1}. You can allocate as many subscriptions as you need. We will review the total number with you at renewal time.', availableCount, overUserCount)
                    .then((text) => {
api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "OverAllocatedAlert",
                            status: "high",
                            icon: "circle-info-outline",
                            "content": {
                                "type": "html",
                                "value": text,
                            },
                            action: {
                                type: "dismiss"
                            },
                        }]
                    });
                    });                    
                }
                break;
            case 'afail':
                //display notification for group allocation failure
                helpers.translate('Failed to add record to the database. There was an issue with the backend script. Please try again later.')
                .then((text) => {
api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "allocatedAFailAlert",
                        status: "critical",
                        icon: "circle-info-outline",
                        "content": {
                            "type": "html",
                            "value": text
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
                });
                
                break;
            case 'cfail':
                //display notification for failure in updating counts
                helpers.translate('Unable to update subscription allocation count. Refresh the page or try again at a later time.')
                .then((text) => {
api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "allocatedCFailAlert",
                        status: "warning",
                        icon: "circle-info-outline",
                        "content": {
                            "type": "html",
                            "value": text
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
                });
                
                break;
        }
    }

}
