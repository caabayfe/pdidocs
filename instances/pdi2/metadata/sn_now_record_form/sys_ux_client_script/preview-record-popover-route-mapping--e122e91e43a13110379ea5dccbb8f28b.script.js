/**
* preview record in a display only form inside macroponent popover element.
* Form Controller's Internal Event Mappings to this client script is conditional, the following 3 conditions must be satisifed
* 1. !!event.payload.actionEvent.target
* 2. !!api.state.popoverNavigation
* 3. !event.payload.actionEvent.metaKey
* 
* @param {params} params
* @param {api} params.api
* @param {event} params.event
*/
function previewRecordPopoverRouteMapping({api, event}) {
	// we need to this event.elementId to help us re-route it back to the existing configured route when needed
	const popoverPayload = {
		...event.payload, 
		actionEvent: null,
		sourceEventElementId: event.elementId
	};
	const popover = api.state.popoverNavigation.popover || { closed: true };
	api.setState('popoverNavigation', {
		payload: popoverPayload,
		fieldName: popoverPayload.fieldName,
		popover,
		buttonDisabled: !popoverPayload.fields?.table || !popoverPayload.fields?.sysId
	});

	if (api.context.props.requireExplicitEventMapping) { 
		//with multi-form compatible
		api.emit('CTRL_RECORD#POPOVER_OPEN_REQUESTED', {
			popoverTriggerElement: event.payload.actionEvent.target
		});
	} else {
		api.emit('MACROPONENT_POPOVER_OPEN_REQUESTED', {
			popoverElementId: 'reference_info_popover',
			popoverTriggerElement: event.payload.actionEvent.target
		});
	}
}
