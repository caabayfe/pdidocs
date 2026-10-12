/*** @param {params} params*
 * @param {api} params.api*
 * @param {any} params.event*
 * @param {any} params.imports*
 * @param {ApiHelpers} params.helpers*/
function handler({api, event, helpers, imports}) {
	// do not perform anything on PAE pages, as we redirect to 'analytics-center-home'
    if (api.context.app.appId == "08c73d60537101100834ddeeff7b1287") {
        return;
    }
	const acceptedDashboardFilters = ['recent', 'bookmarked', 'certified', 'created_by_me', 'shared_with_me', 'none'];
	const acceptedVizFilters = ['all', 'bookmarked', 'certified', 'created_by_me', 'shared_with_me'];
	const acceptedKpiFilters = api.state.kpiCategoryList.map(e => e.id);
	let currentFilter;
	switch(api.state.selectedTabIndex) {
		case '1':
		case 1:
			currentFilter = acceptedDashboardFilters.find(e => e === api.state.dashboardFilter) || 'recent';
			if(api.state.dashboardFilter !== currentFilter) {
				api.setState('dashboardFilter', currentFilter);
			}
			break;
		case '2':
		case 2:
			currentFilter = acceptedVizFilters.find(e => e === api.state.predefinedFilterType) || 'all';
			if(api.state.predefinedFilterType !== currentFilter) {
				api.setState('predefinedFilterType', currentFilter);
			}
			break;
		case '3':
		case 3:
			currentFilter = acceptedKpiFilters.find(e => e === api.state.kpiFilter) || acceptedKpiFilters[0];
			const {reloadListWithFilters} = imports['sn_app_analytics_w.GenerateFilter']();
			const { showBookmarked, filterCondition } = reloadListWithFilters(currentFilter, api.state.kpiSearchTerm, api.context.session.user.userName);
			if(api.state.kpiFilter !== currentFilter || api.state.filterCondition !== api.state.filterCondition || api.state.showBookmarked !== showBookmarked) {
				api.setState('kpiFilter', currentFilter);
				api.setState('showBookmarked', showBookmarked);
				api.setState('filterCondition', filterCondition);
			}
			break;
	}
	api.emit("CONTENT_UPDATED", {params: {tab: api.state.selectedTabIndex, filter: currentFilter,}});
}
