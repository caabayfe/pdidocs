/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let {
        dependencyState
    } = api.state;

    let {
        item : obj,
        value: dependentClass
    } = event.payload;

    dependencyState.selectedDependentCi = null;
    dependencyState.selectedDependentObj = obj;
    dependencyState.selectedDependentClass = dependentClass;
    dependencyState.hideDepCiTypeahead = (dependentClass == null || dependentClass == "");
    api.setState("dependencyState", JSON.parse(JSON.stringify(dependencyState)));
    api.setState("dependentCiValue", "");
}
