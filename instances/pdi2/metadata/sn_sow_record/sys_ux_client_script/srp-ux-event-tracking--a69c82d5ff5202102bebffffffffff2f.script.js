/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function evaluateEvent({
    api,
    event
}) {
    const {
        name,
        payload
    } = event;
    var appseePayload = {};

    switch (name) {
        case 'UXF_TAB_SET#TAB_SELECTED':
            if (event.payload.isInitialPageLoad) {
                return;
            }

            const selectedTab = payload.selectedTab;

            let tabName = '';

            if (selectedTab.includes("^route=")) {
                // This is a page collection
                tabName = selectedTab.split("^route=")[1];
            } else if (selectedTab.includes("^index=")) {
                // This is a repeater tab
                tabName = selectedTab.split("=")[1].split("^")[0];
            } else {
                // This is a static tab
                tabName = selectedTab.split("=")[1];
            }

            appseePayload = {
                event: "Click record tab",
                value: {
                    "Tab name": tabName
                }
            };
            break;
    }
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', appseePayload);
}
