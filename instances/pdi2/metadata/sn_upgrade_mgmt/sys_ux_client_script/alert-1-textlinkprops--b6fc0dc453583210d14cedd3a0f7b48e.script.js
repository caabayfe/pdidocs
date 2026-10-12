/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    "label": helpers.translateSync("View upgrade plan"),
    "href": "/sys_upgrade_plan.do?sys_id=" + api.state.upgradePlanId
  };
}
