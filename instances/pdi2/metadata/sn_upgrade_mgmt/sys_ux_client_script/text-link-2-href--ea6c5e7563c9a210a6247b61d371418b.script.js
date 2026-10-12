/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.experienceProperties.upgrade_plan_sysid.value)
    return '/sys_upgrade_plan.do?sys_id=' + api.context.props.experienceProperties.upgrade_plan_sysid.value;
  return '/sys_upgrade_plan_list';
}
 
