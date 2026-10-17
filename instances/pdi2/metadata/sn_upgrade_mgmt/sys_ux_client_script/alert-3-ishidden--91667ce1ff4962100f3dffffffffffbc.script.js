/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api.state.showSchemaTriggerAlert && api.state.upgradeStage === "Scheduled" && api.data.look_up_multiple_records_2.results.length === 0);
}
