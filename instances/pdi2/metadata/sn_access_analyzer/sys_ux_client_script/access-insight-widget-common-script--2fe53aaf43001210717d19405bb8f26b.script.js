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

    function openPopover() {
        let tms = api.state.translatedMessages;
        let info, title;
        switch (event.elementId) {
            case "btnAppInfo":
                title = tms.insightsTitle;
                info = tms.insightsInfo;
                break;
            case 'btnInsightsLevelInfo':
                if (event.context.item.value.type.startsWith('Org')) {
                    title = tms.orgInsightsTitle;
                    info = tms.orgInsightsInfo;
                } else {
                    title = tms.peerInsightsTitle;
                    info = tms.peerInsightsInfo;
                }
        }
        api.setState("popoverData", {
            title: title,
            info: info
        });
    }

    function contextMenuHandler() {
        /**
         * Send event to main component with payload
         */
        helpers.navigate.setRouteParams({
            params: {
                payload: {
                    action: event.payload.item.id,
                    data: event.context.item.value,
                    ts: Date.now()
                }
            }
        });
    }

    const fnMap = {
        btnAppInfo: openPopover,
        btnInsightsLevelInfo: openPopover,
        contextMenu: contextMenuHandler
    };

    const fn = fnMap[event.elementId];
    if (fn)
        fn();
}
