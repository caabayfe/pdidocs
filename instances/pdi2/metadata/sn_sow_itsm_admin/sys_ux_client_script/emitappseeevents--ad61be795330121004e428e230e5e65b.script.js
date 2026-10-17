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
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName.includes("Helpful_Resources")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Helpful Resources Clicked",
            value: {
                "eventName": eventPayload.item.label.split(' ').map(function(word) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join(' '),
                "scope_id": "sn_sow_itsm_admin",
                "sys_id": eventPayload.contentBlockId
            }
        });
    } else if (eventName.includes("Learning_Resources")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Click resources",
            value: {
                "resourceName": eventPayload.item.module_name,
                "scope_id": "sn_sow_itsm_admin",
                "sys_id": eventPayload.contentBlockId
            }
        });
    } else if (eventName.includes("Learning_FAQs_Expand")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Click faq question expand",
            value: {
                "resourceName": eventPayload.item.question,
                "scope_id": "sn_sow_itsm_admin",
                "sys_id": eventPayload.contentBlockId
            }
        });
    } else if (eventName.includes("Learning_AdoptionBlueprint")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Click adoption blueprint",
            value: {
                "scope_id": "sn_sow_itsm_admin",
                "sys_id": eventPayload.contentBlockId
            }
        });
    }
}
