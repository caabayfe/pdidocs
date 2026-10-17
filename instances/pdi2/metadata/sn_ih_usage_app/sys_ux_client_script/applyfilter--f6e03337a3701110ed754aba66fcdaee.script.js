/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function applyFilter ({ api, event, imports }) {

    api.setState('parFilters', ({ currentValue }) => {
        const { payload: { appliedFilters } } = event;
        if (appliedFilters[0].apply_to[0]) {
                const featureUsageColumnReference = appliedFilters[0].apply_to[0].replace('ua_ih_usage','ua_ih_feature_usage');
                appliedFilters[0].apply_to.push(featureUsageColumnReference);
        }
        const parFilters = imports['global.mergePARFilters']()(currentValue, appliedFilters);
        return parFilters;
    });
}
