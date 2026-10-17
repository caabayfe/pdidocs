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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = { ...eventPayload.blockcontext
    };
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch (eventName) {
        case "LG#GRID_VIEW_SELECTED":
            blockcontext.showGridView = true;
            blockcontext.showListView = false;
            blockcontext.gridButtonVariant = "primary";
            blockcontext.listButtonVariant = "secondary";
            publish();
            break;
        case "LG#LIST_VIEW_SELECTED":
            blockcontext.showGridView = false;
            blockcontext.showListView = true;
            blockcontext.gridButtonVariant = "secondary";
            blockcontext.listButtonVariant = "primary";
            publish();
            break;
        case "LG#ACTION_BUTTON_CLICKED":
            navigateToPage({
                route: 'skills',
                fields: {
                    "featureId": eventPayload?.item?.id
                }
            });
            let array = blockcontext.pageBreadcrumbs[1]?.label.split(": ");
            trackUsage("View details", {feature : eventPayload?.item?.title?.label, product : array[1] ? array[1] : array[0], workflow : array[0]});
            break;
        case "PRODUCT#SELECTED_ITEM":
            blockcontext.selectedProduct = eventPayload.value;
            addLoader();
            publish();
            aceUtils.refreshContentBlock('feature_skills').then(() => {
                addLoader(false);
            });
            break;
        case "ALERT#ACTIONCLICKED":
            navigateToPage({
                route: 'plugins',
                params: {
                    workflow: blockcontext.pluginUrl.split('/').pop()
                }
            });
            break;
    }

    function navigateToPage(navPayload, reload = false) {
        api.emit("NAV_ITEM_SELECTED", {
            reload: reload,
            ...navPayload
        });
    }

    function addLoader(loader=true) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: loader,
                label: "Loading",
                action: null,
                nonBlocking: false
            });
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
