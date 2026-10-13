var EvtMgmtConnectorMediator = Class.create();

// There is script include (ConnectorTestExecutor) created in event management scope to test pull connector for integration launchpad project. 
// It has dependencies on other scripts which are in global scope and those were not callable from event management scope. 
// For this, created mediator script in global scope allowing it to be accessed from all application scope.
EvtMgmtConnectorMediator.prototype = {

    ERROR: "error",

    initialize: function() {
        this.evtMgmtAlertTagUtils = new EvtMgmtAlertTagsUtil();
		this.connectorInstanceAssignmentGroupHelper = new SNC.ConnectorInstanceAssignmentGroupHelper();
    },

    // This will be called from integration launchpad project to add tags that are attached to connector instance to em_alert_tags table. These tags will be populated to alerts.
    addNewAlertTagIfDoesntExistInTable: function(tagName) {
        this.evtMgmtAlertTagUtils.addNewAlertTagIfDoesntExistInTable(tagName);
    },
    getAlertTags: function() {
        return this.evtMgmtAlertTagUtils.getAlertTags();
    },

    // Test pull connector
    // This is duplicate of UI action 'Test Connector'. Any changes that are being made here, might needs to do in UI action.
    testPullConnector: function(ciGr) {

        var message;
        var connectorUtil = new ConnectorUtil();
        // find mid server 
        var agentName = connectorUtil.findAgent(ciGr);
        if (gs.nil(agentName)) {
            message = gs.getMessage('Cannot find a proper mid server. Make sure at least one mid server is running and please check IP Ranges, and capabilities assigned to mid servers');
            return this.generateConnectorTestResult(this.ERROR, message);
        }

        // Setup and start worker
        // NOTE:order of parameters should match
        // function process definition of the worker
        var worker = new GlideScriptedProgressWorker();
        worker.setProgressName("Connector Instance Connection Test");
        worker.setName('EventManagementConnectorTestWorker');
        worker.addNonEscapedParameter(ciGr.sys_id);
        worker.addNonEscapedParameter(agentName);
        worker.setBackground(false);
        worker.start();


        var workerGr = new GlideRecord("sys_progress_worker");
        if (!workerGr.get(worker.getProgressID())) {
            message = gs.getMessage("Cannot continue because there is no ecc record.");
            return this.generateConnectorTestResult(this.ERROR, message);
        }

        return this.generateConnectorTestResultWithOutputSummary(workerGr.getValue('state_code'),
            workerGr.getValue('message'),
            workerGr.getValue('output_summary'));

    },

    generateConnectorTestResultWithOutputSummary: function(status, message, output_summary) {
        var results = {};
        results['status'] = status ? status : this.ERROR;
        results['message'] = message;
        results['output_summary'] = output_summary;
        return results;
    },
    //  creating MID script include for custom connector
   createCustomMidScriptInclude: function(name, description,script) {
          try {
              var mid_script_record = new GlideRecord('ecc_agent_script_include');
              mid_script_record.initialize();
              mid_script_record.name = name;
              mid_script_record.description = description;
              mid_script_record.active = true;
              if(script != null && script != ''){
                  mid_script_record.script = script;
              }
              var mid_script_sys_id = mid_script_record.insert();
              return mid_script_sys_id;
          } catch (e) {
              throw e;
          }
      },
     //  deleting MID script include for custom connector
    deleteCustomMidScriptInclude: function(sys_id) {
        try {
            var mid_script_include = new GlideRecord('ecc_agent_script_include');
            mid_script_include.get(sys_id);
            mid_script_include.deleteRecord();
        } catch (e) {
            throw " MID script Include sys_id: " + sys_id + " is not valid " + e;
        }
    },
     //  updating MID script include for custom connector
    updateCustomMidScriptInclude: function(name, description, mid_server_script_include_sys_id, script) {
        try {
            var mid_script_record = new GlideRecord('ecc_agent_script_include');
            mid_script_record.get(mid_server_script_include_sys_id);
            if (mid_script_record.isValidRecord()) {
                mid_script_record.setValue('name', name);
                mid_script_record.setValue('description', description);
				if(script != null && script != ''){
				mid_script_record.script = script;
				}
                mid_script_record.update();
            } else {
                throw "Mid Script Include sys_id: " + mid_server_script_include_sys_id + " is not valid";
            }
        } catch (e) {
            throw e;
        }
    },
    generateConnectorTestResult: function(status, message) {
        return this.generateConnectorTestResultWithOutputSummary(status, message, message);
    },

	getAssignmentGroup: function(connectorInstanceName) {
        return this.connectorInstanceAssignmentGroupHelper.getAssignmentGroup(connectorInstanceName);
    },
	
    type: 'EvtMgmtConnectorMediator'
};
