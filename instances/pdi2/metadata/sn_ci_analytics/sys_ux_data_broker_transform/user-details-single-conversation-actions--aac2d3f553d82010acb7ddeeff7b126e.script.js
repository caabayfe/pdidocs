function transform(input) {
	var timelineActions = input.singleConversation && input.singleConversation.CustomEvents && input.singleConversation.CustomEvents.map(function(action){
		return {
			name: action.Name,
			time: action.Time,
			properties: action.Properties,
			type: action.Type
		};
	});
	
	return timelineActions;
}
