/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
  "label": api.data.get_upgrade_plan_name_1.output.plan_name,
  "href": "/sys_upgrade_plan.do?sys_id=" + api.context.props.experienceProperties?.upgrade_plan_sysid?.value
  }
}
