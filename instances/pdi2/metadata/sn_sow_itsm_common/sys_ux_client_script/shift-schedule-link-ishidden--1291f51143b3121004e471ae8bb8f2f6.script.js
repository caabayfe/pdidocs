/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const shift_planning_plugin_status = api.data.enabled_plugins.output && api.data.enabled_plugins.output.length > 0 ? 
                                      api.data.enabled_plugins.output.find(p => p.id === "sn_uib_agent_sp") : {};
  const shift_planning_agent = api.data.check_user_roles.output && api.data.check_user_roles.output["sn_shift_planning.agent"];
  if (shift_planning_plugin_status.active && shift_planning_agent)
      return false;
  return true;
}
