/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  var index = event.context.item.index;
  var commTasks = [];
  var groupBy = api.state.groupBy;
  if (groupBy == "completion_status") commTasks = api.state.commTasksByState;
  else commTasks = api.state.commTasksByPlan;
  commTasks[index].expanded = !commTasks[index].expanded;
  if (groupBy == "completion_status")
    api.setState("commTasksByState", [...commTasks]);
  else api.setState("commTasksByPlan", [...commTasks]);
}
