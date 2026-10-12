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
debugger
    const rowData = event.payload.row.rowData.value;
    rowData.forEach((value, key) => {
        if (key === 'subscription') {
            if (value.columnData.displayValue === 'Now Assist creators') {
                // navigate to creator
                const menuName = "creator";
                const params = {
                    "sm": "subscriptions",
                    "menu": menuName
                };
                api.emit("CONTENT_UPDATED", {
                    params
                });

                emitNavToSubEvent(menuName);
            }
            if (value.columnData.displayValue === 'Now Assist usage') {
                // navigate to now assists
                const menuName = "nowassists";
                const params = {
                    "sm": "subscriptions",
                    "menu": menuName
                };
                api.emit("CONTENT_UPDATED", {
                    params
                });

                emitNavToSubEvent(menuName);
            }
            if (value.columnData.displayValue === 'Cloud capacity') {
                // navigate to now assists
                const menuName = "cloud";
                const params = {
                    "sm": "subscriptions",
                    "menu": menuName
                };
                api.emit("CONTENT_UPDATED", {
                    params
                });

                emitNavToSubEvent(menuName);
            }
        }
    });

    function emitNavToSubEvent(menuName) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            "event": "Navigate to Subscriptions",
            "value": {
                "menu": menuName
            }
        });
    }

}
