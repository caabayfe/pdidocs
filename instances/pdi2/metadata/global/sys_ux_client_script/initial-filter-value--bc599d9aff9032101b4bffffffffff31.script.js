/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.context.props.restrict) {
        const searchInfo = JSON.parse(JSON.stringify(api.state.searchInfo));
        const prefs = api.data[event.elementId].result.preferences;

        const preferenceFilter = prefs && prefs[0] ? prefs[0].value : null;
        const preselectedFilter = api.context.props.selectedFilter || preferenceFilter || 'all';

        searchInfo.selectedFilterPref = preselectedFilter;
        searchInfo.selectedFilter = preselectedFilter.split(',').map(pref => pref.split('~'));

        api.setState('searchInfo', searchInfo);
    }
}
