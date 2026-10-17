/**
* ensure record preview popover form renders the updated reference field value changed by live update
* @param {params} params
* @param {api} params.api
* @param {event} params.event
*/
function script({api, event}) {
	const popover = api.state.popoverNavigation;
	if (!popover)
		return;
	const { fieldName, value } = event.payload;
	if (!value ||
		popover.fieldName !== fieldName ||
		popover.payload?.fields?.sysId === value ||
		popover.popover?.closed === true)
		return;
	const updatedPopover = {
		...popover,
		payload: {
			...popover.payload,
			fields: {
				...popover.payload.fields,
				sysId: value
			}
		},
		buttonDisabled: !popover.payload.fields?.table
	};
	api.setState('popoverNavigation', updatedPopover); 
}
