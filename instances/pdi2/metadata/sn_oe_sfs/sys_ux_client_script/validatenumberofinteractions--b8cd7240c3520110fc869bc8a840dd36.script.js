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
    var elementId = event.elementId;
    var input = event.payload.fieldValue;
    // Initial state on page load
    if (elementId == "look_up_for_number_of_interactions") {
        input =  api.state.number_of_interactions;
    }
    if (input == null || input == "" || input == " " || input.includes(".")) { //edge case
        api.setState('invalidNumberOfInteractionsMessage', true);
    } else if (input >= 1 && input <= 25) {
        api.setState('invalidNumberOfInteractionsMessage', false);
    } else {
        api.setState('invalidNumberOfInteractionsMessage', true);
    }
    var invalid = api.state.invalidNumberOfInteractionsMessage;

}
