/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const results = api.data.look_up_multiple_records_3.results;

    const updatedResult = results.map(elem => ({
        id: elem._row_data.uniqueValue || '',
        label: elem.name.value || ''
    }));

    updatedResult.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });

    api.setState('controllerList', updatedResult);
}
