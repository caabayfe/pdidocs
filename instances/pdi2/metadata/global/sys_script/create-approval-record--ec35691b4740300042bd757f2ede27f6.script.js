var propertyName = 'com.sn_itam.enable_flow_designer.contract_approval';
var sysProperty = gs.getProperty(propertyName);

function getFlowFromDecisionTable(decisionID, decisionInputs, defaultFlow) {
	var flow = defaultFlow;
	// eslint-disable-next-line no-undef
	var dtAPI = new sn_dt.DecisionTableAPI();
	try {
		var response = dtAPI.getDecision(decisionID, decisionInputs);
		if (!gs.nil(response)) {
			var resultElements = response.result_elements;
			var flowName = resultElements.flow.internal_name;
			flow = response.sys_scope.scope + '.' + flowName;
		} else {
			flow = '';
		}
	} catch (err) {
		gs.error(decisionID + ': ' + err, 'Contract Approval Flow Trigger');
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
		gs.error(flowName + ': ' + ex.getMessage(), 'Contract Approval Flow Trigger');
	}
}

(new ContractManagementUtils()).updateTermsAndConditions(current.sys_id);

if (sysProperty === 'false') {
	// Execute legacy Workflow
	var wflw = new Workflow();
	wflw.startFlow(wflw.getWorkflowFromName('Contract Approval'), current, 'update');
} else {
	// Execute Flow Designer Flow
	var defaultFlow = 'global.contract_approval_flow';
	var C_CONTRACT_APPROVAL_DECISION_ID = 'ae8c2be97f2bde10b8791b46ec86657b';
	var decisionInputs = {};
	decisionInputs.contract_record = current.sys_id;

	var flow = getFlowFromDecisionTable(C_CONTRACT_APPROVAL_DECISION_ID, decisionInputs, defaultFlow);
	if (gs.nil(flow)) {
		gs.addErrorMessage(gs.getMessage('Flow is not configured in decision table'));
	} else {
		var inputs = {
			current: current,
			table_name: 'ast_contract',
		};
		triggerFlowSyncronously(flow, inputs);
	}
}
