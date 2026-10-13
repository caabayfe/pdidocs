/**
 * @param {params} params 
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
  var output = event.payload.controllerOutput;
  const commManagementUtil = imports['sn_uib_tcm.CommunicationManagementUXFClientBaseUtil']();
  if (output && output.type == "ICT_DATA" && output.status == true) {
    var data = output.ICT_DATA;
    var commTasksByState = addAdditionalFlags(data.commTasksByState || []);
    var commTasksByPlan = addAdditionalFlags(data.commTasksByPlan || []);
    var filtersArr = [{
      id: "all",
      label: await helpers.translate("Select all")
    }];

    filtersArr = [...filtersArr, ...data.filteredPlans];
    const currentFilters = api.state.filterBy;
    if (currentFilters && currentFilters.length && currentFilters.indexOf("all") == -1) {
      const tabType = api.context.props.tabType;
      commTasksByState = commManagementUtil.filterCommTasks(commTasksByState, currentFilters, tabType);
      commTasksByPlan = commManagementUtil.filterCommTasks(commTasksByPlan, currentFilters, tabType);
    } else api.setState("filterBy", [...getFilterByIds(filtersArr)]);
    
    api.setState("commTasksByState", [...commTasksByState]);
    api.setState("commTasksByPlan", [...commTasksByPlan]);
    api.setState("filtersArr", [...filtersArr]);
    api.setState("permissions", {...data.permissions});
    api.setState("errorState", false);
    api.setState("dataLoaded", true);
  } else if (output && output.type == "ICT_DATA" && (output.error_messages || output.status == false)) {
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        "items": [{
            "id": "comm-error-msg",
            "action": {
                "type": "dismiss"
            },
            "content": "Communication(s) data fetch failed",
            "status": "critical",
            "icon": "exclamation-triangle-outline"
        }]
    });
    api.setState("errorState", true);
    api.setState("dataLoaded", true);
  }

  function addAdditionalFlags(commPlanData) {
    for (var i = 0; i < commPlanData.length; i++) {
      commPlanData[i].expanded = true;
      commPlanData[i].visibleTasks = commPlanData[i].comm_tasks.length;
    }
    return commPlanData;
  }

  function getFilterByIds(filters) {
    var filterBy = [];
    for (var i = 0; i < filters.length; i++) {
      filterBy.push(filters[i].id);
    }
    return filterBy;
  }
}
