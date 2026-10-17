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
    let selectedCondFromModal = api?.state?.selectedConditionFromModal;
    let newConditionsOnTheUI = api?.state?.conditionsOnTheUI;
    let conditionsForModalDropDown = api?.state?.conditionsForModalDropDown;
    if (!selectedCondFromModal || !newConditionsOnTheUI || !conditionsForModalDropDown) {
        return;
    }
    let newConditionsForModalDropDown = [];
    if (newConditionsOnTheUI.length) {
        for (var i = 0; i < newConditionsOnTheUI.length; i++) {
            var condition = newConditionsOnTheUI[i];
            if (condition["model_id"] == selectedCondFromModal) {
                condition["displayOff"] = false;
            } else if (conditionsForModalDropDown.length > 1 &&  condition["displayOff"] != false) {
                // Only allow new modal value to be pushed, when it is not the last option chosen and the condition on the UI dodesn't exist
                // If the last option from the modal is selected newConditionsForModalDropDown should not be updated but to be emptied
                newConditionsForModalDropDown.push(condition);
            }
        }
    }
    var stateValue = api.state.emptyValueCondition;
    stateValue.push(selectedCondFromModal);
    api.setState("emptyValueCondition", stateValue);
    api.setState("modalSelectedState", []);
    api.setState("conditionsForModalDropDown", newConditionsForModalDropDown);
    api.setState("conditionsOnTheUI", newConditionsOnTheUI);
}
