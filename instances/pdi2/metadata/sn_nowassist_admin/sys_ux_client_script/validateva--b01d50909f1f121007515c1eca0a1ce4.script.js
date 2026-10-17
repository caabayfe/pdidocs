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
    var vaInvalid;
    switch (event.elementId) {
        // When Virtual Agent is selected from Conversational experiences dropdown
        case "typeahead_multi_5":
            vaInvalid = event.payload.value.some(item => item.id === "va") && !api?.state?.selectedVAList?.length;
            break;
            //When VAs are selected from Virtual Assistants dropdown
        case "typeahead_multi_6":
            vaInvalid = !event.payload.value.length;
            api.setState('selectedVAList', event.payload.value);
            break;
        default:
            vaInvalid = false;
    }
    var alertData = vaInvalid ? [{
        status: "critical",
        content: await helpers.translate("Please select at least one Virtual Assistant.")
    }] : [];

    api.setState("vaInvalid", vaInvalid);
    api.setState("vaAlert", alertData);
    api.emit("ACE_ACTION_PERFORMED", {
        eventName: vaInvalid ? 'SN_NS_ADMIN_DISABLE_NEXT' : 'SN_NS_ADMIN_ENABLE_NEXT'
    });

}
