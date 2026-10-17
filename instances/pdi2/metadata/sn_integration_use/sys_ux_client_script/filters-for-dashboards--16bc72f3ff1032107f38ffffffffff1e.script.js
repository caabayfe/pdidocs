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
    const {
        appliedFilters
    } = event.payload;
    const [filter] = appliedFilters;
    const updatedFilter = {
        ...filter,
        apply_to: [{
            key: filter.apply_to[0],
            type: filter.source.type,
        }]
    };


    const {
        filterConfigurations,
        parFilters = []
    } = api.state;
    let updatedFilterConfig = [...filterConfigurations];
    let uiFiltersUpdated = parFilters ? [...parFilters] : [];
    const existingFilterIdx = filterConfigurations.findIndex(filterConfig => filterConfig.filterId === filter.filterId);

    if (existingFilterIdx > -1) {
        updatedFilterConfig[existingFilterIdx] = updatedFilter;
        uiFiltersUpdated[existingFilterIdx] = filter;
    } else {
        updatedFilterConfig.push(updatedFilter);
        uiFiltersUpdated.push(filter);
    }

    api.setState('filterConfigurations', updatedFilterConfig.map((filter, index) => ({
        ...filter,
        order: index
    })));
    const updatedUiFilters = uiFiltersUpdated.map((filter, index) => ({
        ...filter,
        order: index
    }));
    api.setState('parFilters', updatedUiFilters);
}
