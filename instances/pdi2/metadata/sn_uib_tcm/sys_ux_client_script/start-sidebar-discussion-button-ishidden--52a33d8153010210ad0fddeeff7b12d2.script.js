/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return ((api.state.collabTaskDetails.isActive) || (api.state.collabTaskDetails.collabType !== "chat") || api.state.collabTaskDetails.channels[0].channelType.value !== 'sidebar-discussion' || !api.state.collabTaskDetails.canInitiateSidebarDiscussion);
}
