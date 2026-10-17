/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var dropdownVals = api.data.create_change_landing_dropdown_values.output.result;
    var propose = dropdownVals.filter(function(item) {
        return item.id === 'propose';
    });
    api.setState('dropdownValues', dropdownVals);
    if (propose.length === 1)
        api.setState('proposeDisabled', propose[0].disabled);
}
