(function executeRule(current, previous /* null when async */) {
	// Add your code here
	function getFlowFromDecisionTable(decisionID, decisionInputs, defaultFlow) {
		var flow = defaultFlow;
		// eslint-disable-next-line no-undef
		var dtAPI = new sn_dt.DecisionTableAPI();
		try {
			var response = dtAPI.getDecision(decisionID, decisionInputs);
			var resultElements = response.result_elements;
			var flowName = resultElements.flow.internal_name;
			if (gs.nil(response)) {
				flow = '';
			} else {
				flow = response.sys_scope.scope + '.' + flowName;
			}
		} catch (err) {
			gs.error(decisionID + ': ' + err, 'Transfer Order Flow Trigger');
		}
		return flow;
	}

	function triggerFlowSyncronously(flowName, inputs) {
		try {
			sn_fd.FlowAPI.getRunner()
				.flow(flowName)
				.inForeground()
				.withInputs(inputs)
				.run();
		} catch (ex) {
			var message = ex.getMessage();
			gs.error(flowName + ': ' + message, 'Transfer Order Flow Trigger');
		}
	}

	var propertyName = 'com.sn_itam.enable_flow_designer.transfer_order';
	var sysProperty = gs.getProperty(propertyName);

	if (sysProperty === 'true') {
		var defaultFlow = 'global.transfer_order';
		var C_TRANSFER_ORDER_DECISION_ID = 'af3f64327fdf1a10b8791b46ec866576';
		var decisionInputs = {};
		decisionInputs.transfer_order = current.sys_id;
		var flow = getFlowFromDecisionTable(C_TRANSFER_ORDER_DECISION_ID, decisionInputs, defaultFlow);
		if (gs.nil(flow)) {
			gs.addErrorMessage(gs.getMessage('Flow is not configured in decision table'));
		} else {
			var inputs = {};
			inputs.current = current;
			inputs.table_name = 'alm_transfer_order';
			triggerFlowSyncronously(flow, inputs);
		}
	}
}(current, previous));
