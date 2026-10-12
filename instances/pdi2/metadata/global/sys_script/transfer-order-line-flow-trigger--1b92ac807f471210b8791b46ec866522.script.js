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
			gs.error(decisionID + ': ' + err, 'Transfer Order Line Flow Trigger');
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
			gs.error(flowName + ': ' + message, 'Transfer Order Line Flow Trigger');
		}
	}

	var TOL_PROPERTY_NAME = 'com.sn_itam.enable_flow_designer.transfer_order_line';
	var sysProperty = gs.getProperty(TOL_PROPERTY_NAME);

	if (sysProperty === 'true') {
		var defaultFlow = 'global.transfer_order_line';
		var C_TRANSFER_ORDER_LINE_DECISION_ID = 'cc4a1bf87f1bd610b8791b46ec86656f';
		var decisionInputs = {};
		decisionInputs.transfer_order_line = current.sys_id;
		var flow = getFlowFromDecisionTable(C_TRANSFER_ORDER_LINE_DECISION_ID, decisionInputs, defaultFlow);
		if (gs.nil(flow)) {
			gs.addErrorMessage(gs.getMessage('Flow is not configured in decision table'));
		} else {
			var inputs = {};
			inputs.current = current;
			inputs.table_name = 'alm_transfer_order_line';
			triggerFlowSyncronously(flow, inputs);
		}
	}
}(current, previous));
