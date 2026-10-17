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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    switch (event.name) {
        case "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET":
            api.setState("selectedUsers", event.payload.value);
            var internalEmails = eventHandler.parseEmailUponCompletionValue(event.payload.value);
            api.setState("internalEmails", internalEmails);
            api.setState("emailUponCompletionSummaryValue", eventHandler.joinInternalExternalEmails(internalEmails, api.state.externalEmails));
            // Clear user suggestion data to default
            eventHandler.callUtilAPI({
                operation: "GET_SYS_USERS",
                query: ""
            }, false);
            break;

        case "NOW_TYPEAHEAD_MULTI#VALUE_SET":
            if (event.payload.value) {
                api.setState('typeaheadValue',event.payload.value);
                eventHandler.callUtilAPI({
                    operation: "GET_SYS_USERS",
                    query: event.payload.value
                }, false);
            }

    }

}
