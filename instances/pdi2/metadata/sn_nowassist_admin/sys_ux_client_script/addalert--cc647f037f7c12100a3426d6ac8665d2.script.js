/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var filterName = api.context?.props?.filterName;
    var status = api?.context?.props?.status;
    if(filterName && status==='activated'){
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "filter_active_success_alert",
                        status: "positive",
                        icon: "circle-check-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Filter {0} has been activated.", filterName)
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
    }
}
