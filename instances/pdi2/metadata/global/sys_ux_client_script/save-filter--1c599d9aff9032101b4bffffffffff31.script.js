/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const newFilter = event.payload.value;

    let shouldUpdateFilter = false;
    if (newFilter && newFilter.length > 0)
        shouldUpdateFilter = JSON.stringify(api.state.searchInfo.selectedFilter) !== JSON.stringify(newFilter);

    if(shouldUpdateFilter) {
        const searchInfo = JSON.parse(JSON.stringify(api.state.searchInfo));
        searchInfo.selectedFilter = newFilter;

        searchInfo.selectedFilterPref = newFilter.map(
            filterArr =>
                `${filterArr[0]}${filterArr.length > 1 ? '~' + filterArr[filterArr.length - 1] : ''}`
        ).join(',');

        api.setState('searchInfo', searchInfo);
        api.emit('UPDATE_USER_FILTER_PREFERENCES', {});
    }
}
