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
    const eventName = event.name;
    if (eventName === "NOW_BUTTON#CLICKED") {
        const { allSelectedRecipients, selectedRole }  = api.state;
        const selectedRecipient = api.state.selectedRecipientTypeAhead;
        if (!selectedRecipient || !selectedRecipient.id || !allSelectedRecipients) return;
        if (selectedRole && selectedRole.id) {
            selectedRecipient.role = {
                id: selectedRole.id,
                label: selectedRole.label
            };
            selectedRecipient.label += " (" + selectedRole.label + ")";
        }
        const found = allSelectedRecipients.findIndex(function(recipient) {
            return recipient.id === selectedRecipient.id;
        });
        if (found !== -1) return;
        allSelectedRecipients.push(selectedRecipient);
        api.setState("allSelectedRecipients", [...allSelectedRecipients]);
        // resetting states
        api.setState("searchQueryTypeAhead", "");
        api.setState("searchResultsTypeAhead", {});
        api.setState("selectedRecipientTypeAhead", {});
        api.setState("selectedRole", {});
    } else if (eventName === "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET") {
        const eventPayloadValue = event.payload.value;
        if (!eventPayloadValue) return;
        api.setState("allSelectedRecipients", eventPayloadValue);
    }
}
