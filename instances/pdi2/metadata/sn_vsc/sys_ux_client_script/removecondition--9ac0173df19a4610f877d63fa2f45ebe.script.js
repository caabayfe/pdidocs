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
    const conditionObj = event?.context?.item?.value;
    let conditionsOnTheUI = api?.state?.conditionsOnTheUI;
    let newConditionsOnTheUI = [];
    let conditionsForModalDropDown = api?.state?.conditionsForModalDropDown;
    let newConditionsForModalDropdown = conditionsForModalDropDown.length ? conditionsForModalDropDown : [];
    var stateValue = api.state.removedConditionId;
    stateValue.push(conditionObj.model_id);
    if (conditionsOnTheUI.length) {
        for (var condition of conditionsOnTheUI) {
            if (condition["model_id"] == conditionObj.model_id) {
                // Remove the condition from the UI
                condition["displayOff"] = true;
                // Add the condition back to the available eligble conditions for the modal
                newConditionsForModalDropdown.push(condition);
            }
            // Keep pushing the "condition" object into new array, so we can reset state to trigger re-render
            newConditionsOnTheUI.push(condition);
        }
    }
    api.setState("conditionsOnTheUI", newConditionsOnTheUI);
    api.setState("conditionsForModalDropDown", newConditionsForModalDropdown);
    api.setState("removedConditionId", stateValue);
}
