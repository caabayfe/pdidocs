function script({ api, event, imports, helpers }) {
  const { fullPath } = event.payload.selectedItem;
  const { policyData } = api.state;
  const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();

  if (fullPath) {
    fullPath.shift();
    policyData.assignment.task_management_field_path = fullPath.join('.');
    api.setState("policyData", cloneDeep(policyData));
    api.setState("refreshCounts", true);
  }
  helpers.modal.close('dot_walk_assignment_modal');
}
