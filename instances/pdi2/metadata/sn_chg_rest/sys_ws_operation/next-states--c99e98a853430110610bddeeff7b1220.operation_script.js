(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError('Change Request id not provided');

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery('sys_id', changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError('Change Request not found');

	var stateTransitions = [];
	var stateLabel = {};
	var chgClassName = changeRequestGr.getRecordClassName();
	var changeRequest = new global.ChangeRequest(changeRequestGr);
	var stateFieldName = changeRequest.getStateFieldName();
	var states = changeRequest.getNextStates();

	if (Array.isArray(states))
		states.forEach(function(state) {
			stateTransitions.push(changeRequest.evaluateMoveTo(state, true));
			stateLabel[state] = global.ChangeCommon.resolveChoiceLabel(chgClassName, stateFieldName, state);
		});

	var currentState = changeRequest.getState();
	states.push(currentState);
	stateLabel[currentState] = global.ChangeCommon.resolveChoiceLabel(chgClassName, stateFieldName, currentState);

	return {
		available_states: states,
		state_transitions: stateTransitions,
		state_label: stateLabel
	};
})(request, response);
