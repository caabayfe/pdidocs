/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const results = api.data.look_up_preset_records.results;
    const transformedResults = results.map(elem => {
        return {
            name: elem.name.displayValue,
            description: elem.description.displayValue,
            component: elem.component.displayValue,
            controller: elem.controller.displayValue,
            presetId: elem._row_data.uniqueValue
        };
    });
    api.setState('existingPresetData',transformedResults);
    api.setState('showExistingPresetInit', false);
}
