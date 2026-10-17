/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.state.categoryWeightCollapseStatus)
        return;
    let collapseStatus = JSON.parse(api.state.categoryWeightCollapseStatus);
    let collapseStatusKey = `${event.context.item.parent.value.maturity}-${event.context.item.value.weight}`;
    collapseStatus[collapseStatusKey] = !collapseStatus[collapseStatusKey];
    api.setState('categoryWeightCollapseStatus', JSON.stringify(collapseStatus));
}
