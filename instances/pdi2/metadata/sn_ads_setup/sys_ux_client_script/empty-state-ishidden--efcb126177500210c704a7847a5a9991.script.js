/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	let contextIds = api.data.playbook_data_broker_1.playbookContextIdsInOrder;
  return api.state.dataLoading || contextIds.length > 0;
}
