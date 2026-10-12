/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('parFilters', ({
        currentValue
    }) => {
        const {
            payload: {
                appliedFilters
            }
        } = event;
        return imports['global.mergePARFilters']()(currentValue, appliedFilters);
    });
    api.emit('PAR_FILTER_STATE_UPDATED');
}
