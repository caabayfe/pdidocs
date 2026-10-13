/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return (api.state.sent || (api.data.get_comm_task_channel_details.output && api.data.get_comm_task_channel_details.output.data && Object.keys(api.data.get_comm_task_channel_details.output.data).length == 1 ) && api.data.get_comm_task_channel_details.output.data['dex-desktop-assistant'] && !api.data.get_comm_task_channel_details.output.data['dex-desktop-assistant'].available);
}
