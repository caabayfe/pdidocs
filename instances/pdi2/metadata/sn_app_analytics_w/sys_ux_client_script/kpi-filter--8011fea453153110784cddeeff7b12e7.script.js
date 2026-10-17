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
    let kpiCategory = api.state.kpiFilter;
    if (event.payload.item) {
        kpiCategory = event.payload.item.id;
        api.setState('kpiFilter', kpiCategory);
    }

    let kpiSearchTerm = api.state.kpiSearchTerm;
    if (typeof event.payload.searchTerm !== 'undefined') {
        kpiSearchTerm = event.payload.searchTerm;
        api.setState('kpiSearchTerm', kpiSearchTerm);
    }

    const {
        reloadListWithFilters
    } = imports['sn_app_analytics_w.GenerateFilter']();

    let {
        showBookmarked,
        filterCondition
    } = reloadListWithFilters(kpiCategory, kpiSearchTerm, api.context.session.user.userName);
    
    if (filterCondition.indexOf('display=true') <= -1) {
        filterCondition = filterCondition != '' ? filterCondition + '^display=true' : 'display=true';
    }
    
    api.setState('showBookmarked', showBookmarked);
    api.setState('filterCondition', filterCondition);
    api.emit('CONTENT_UPDATED', {
        params: {
            filter: kpiCategory
        }
    });
}
