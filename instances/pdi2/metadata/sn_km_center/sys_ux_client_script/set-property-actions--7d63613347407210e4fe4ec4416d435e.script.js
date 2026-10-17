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
    if (event.payload.item.id === "editProperty") {
        let propertyId = '';
        if (event.context && event.context.item && event.context.item.value.sysId) {
            propertyId = event.context.item.value.sysId;
        }

        const baseUrl = helpers.getCurrentExperienceUrl();
        //Construct the URL redirection to property record
        var redirectPayload = {
            "redirect": true,
            "route": "record",
            "fields": {
                "table": "sys_properties",
                "sysId": propertyId
            }
        };
        api.emit("NAV_ITEM_SELECTED", redirectPayload);
    }
    
    if (event.payload.item.id === "copyClipboard") {
        const textToCopy = event.context.item.value.name;
        helpers.writeText(textToCopy).then(function() {
            helpers.translate('Copied to clipboard').then((value) => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "copyPropertyAlert",
                        status: "info",
                        icon: "info-circle-outline",
                        content: value,
                        action: {
                            type: "dismiss"
                        }
                    }],
                });
            });
        });
    }
}
