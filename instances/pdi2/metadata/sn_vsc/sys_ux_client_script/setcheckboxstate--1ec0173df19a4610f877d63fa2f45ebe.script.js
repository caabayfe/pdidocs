/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const model_id_from_checkBox = event?.payload?.name;
    const value = event?.payload?.value;
    let conditionsOnTheUI = api?.state?.conditionsOnTheUI;
    let newConditionsForUI = [];
    if (conditionsOnTheUI && conditionsOnTheUI.length) {
        for (var condition of conditionsOnTheUI) {
            if (condition.model_id == model_id_from_checkBox) {
                condition["is_check_box_checked"] = value;
            }
            newConditionsForUI.push(condition);
        }
    }
    api.setState("conditionsOnTheUI", newConditionsForUI);
    
    const checkboxChecked = {
        ...api.state.checkboxValue,
        [model_id_from_checkBox]: value
    };

    api.setState('checkboxValue', checkboxChecked);
}
