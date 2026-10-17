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
    const filterId = api.state.filterSelected;
    if (filterId) {
        const dimensions = api.state.dimensions;
        const disableFilters = dimensions.filter(dimension => dimension.sysId !== filterId).map(dimension => dimension.sysId);

        api.setState("disabledFilters", disableFilters);
    }
}
