testConnector();

// There is script include 'ConnectorTestExecutor' which is duplicate of this. 
// It is created as a backend api to test pull connector. It calls mediator script include 'EvtMgmtConnectorMediator'.
// Any changes that are being made here, might need to do same in script include (ConnectorTestExecutor or EvtMgmtConnectorMediator)
function testConnector() {
	var con = new ConnectorUtil();
	var message;
	if (current.connector_definition.name == "SCOM"){
		var connectorVal = new GlideRecord("em_connector_instance_value");
		connectorVal.addQuery("connector_instance", current.sys_id);
		connectorVal.addQuery("name", "scom_version");
		connectorVal.query();
		var isDefined = 0;
        if (connectorVal.next()) {
            var allowedVersions = ["2007", "2012", "2016", "2019", "2022", "2025"];
            if (allowedVersions.includes(connectorVal.getValue("value"))) {
                isDefined = 1;
            }
        }
		if (isDefined == 0){
			message =  gs.getMessage("SCOM version is not defined or invalid");
			gs.addErrorMessage(message);
			current.setAbortAction(true);
			return;
		}
	}
	var agentName = con.findAgent(current);
	if (gs.nil(agentName)) {
			message =  gs.getMessage('Cannot find a proper mid server. Make sure at least one mid server is running and please check IP Ranges, and capabilities assigned to mid servers');
		gs.addErrorMessage(message);
		current.setAbortAction(true);
		return;
	}

	var kpiActive = current.getValue('kpi');
	if(kpiActive == true) {
		var kpiMid = con.findValidAgentForMetricCollection(current);

		if (gs.nil(kpiMid)) {
			message = gs.getMessage("Can not find a MID Server to use for Metric Collection.");
			gs.addErrorMessage(message);
			current.setAbortAction(true);
			return;
		}
	}		
	
	current.update();
	
	// Setup and start worker
	// NOTE:order of parameters should match
	// function process definition of the worker
	var worker = new GlideScriptedProgressWorker();
	worker.setProgressName("Connector Instance Connection Test");
	worker.setName('EventManagementConnectorTestWorker');
	worker.addNonEscapedParameter(current.sys_id);
	worker.addNonEscapedParameter(agentName);
	worker.setBackground(true);
	worker.start();
	
	// Redirect
	var redirect = "event_management_connector_test_status.do?sysparm_pworker_sysid=" + worker.getProgressID();
	redirect += "&sysparm_con_instance_id=" + current.sys_id;
	action.setRedirectURL(redirect);
	
}
