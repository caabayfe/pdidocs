/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const sysId = api.data.get_upgrade_plan_items_1.output.sys_id;
    if (!sysId) {
        return helpers.translateSync("No retrieved upgrade plans found for the selected target patch, new upgrade plan will be generated.");
    } 
        return helpers.translateSync("Your upgrade plan is generated based on retrieved update set");
}
