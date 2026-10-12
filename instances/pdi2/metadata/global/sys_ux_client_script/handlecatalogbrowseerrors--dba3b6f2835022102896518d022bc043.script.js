/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (api.state.componentReadyEventDispatched) { //check for partial errors
        const isLoadSubCategoryEvent = event.elementId === "load_sub_categories_on_demand___for_catalog_browse_1";

        if (isLoadSubCategoryEvent) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "hideErrorsNotification",
                    status: "critical",
                    icon: "circle-close-outline",
                    enableFocus: "true",
                    content: await helpers.translate("Something went wrong. Please try again."),
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        } else {
            const header = await helpers.translate("Something went wrong");
            const body = await helpers.translate("Please try again or contact the admin.");
            api.setState("catalogItemsEmptyOrErrorInfo", {
                message: {
                    header,
                    body,
                },
                icon: "error"
            });
        }
        api.setState("hideCatalogItemsEmptyOrErrorState", isLoadSubCategoryEvent);
        api.setState("hideCatalogItemsLoadingState", true);
        api.setState("hideCatalogItemsContainer", !isLoadSubCategoryEvent);
    } else {
        api.setState("hideErrorState", false);
        api.setState("hideLoadingState", true);
        api.setState("hideComponent", true);
        api.setState("hideEmptyState", true);
    }
    var errorMessage = await helpers.translate("Try refreshing the page.");
    var errorType = event.payload.errorType ? event.payload.errorType : "internal_error";
    api.emit('CATALOG_BROWSE#COMPONENT_ERROR', {
        errorType: errorType,
        errorMessage: [{
            message: errorMessage
        }]
    });
}
