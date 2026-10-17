/**
 * @param {params} params  
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const commManagementUtil = imports['sn_uib_tcm.CommunicationManagementUXFClientBaseUtil']();
  var currentFilters = event.payload.value;
  var filterBy = api.state.filterBy;
  var filters = api.state.filtersArr;
  var indexOfAllInCurrFilter = currentFilters.indexOf("all");
  var indexOfAllInFilter = filterBy.indexOf("all");
  var tabType = api.context.props.tabType;
  var selectAll = filters.length <= 2  || (tabType === "Communicate" && (!currentFilters || !currentFilters.length || ((indexOfAllInCurrFilter * indexOfAllInFilter) <= 0 && indexOfAllInFilter != indexOfAllInCurrFilter) || (indexOfAllInCurrFilter == -1 && currentFilters.length == filters.length - 1))) || (tabType === "Collaborate" && indexOfAllInCurrFilter != -1);
  if (selectAll) {
    currentFilters = [];
    for (var i = 0; i < filters.length; i++) {
      currentFilters.push(filters[i].id);
    }
  } else {
    if (indexOfAllInCurrFilter != -1) currentFilters.splice(indexOfAllInCurrFilter, 1);
  }
  api.setState("filterBy", [...currentFilters]);
  var commTasksByState = api.state.commTasksByState || [];
  var commTasksByPlan = api.state.commTasksByPlan || [];
  api.setState("commTasksByState", [
    ...commManagementUtil.filterCommTasks(commTasksByState, currentFilters, tabType),
  ]);
  if (tabType === "Communicate") {
    api.setState("commTasksByPlan", [
      ...commManagementUtil.filterCommTasks(commTasksByPlan, currentFilters, tabType),
    ]);
  }
}
