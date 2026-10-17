var EventManagementConnectorTestWorker = Class.create();
EventManagementConnectorTestWorker.prototype = {
	WAIT_TIME : GlideProperties.get('evt_mgmt.connector_test.progress_timeout', 120),
	NAME_PREFIX : 'EM-Connector-Test-',
	INTERVAL : 5000, // 5 sec,
	RUN_COUNT : 24, // default total to 120
	
	initialize: function() {
		this.RUN_COUNT = parseInt((1000 * this.WAIT_TIME)/this.INTERVAL);
	},
	
	// UI action kicks of the test with this method.
	process: function(con_instance_id, agentName) {
		var LOG_ID = '[EventManagementConnectorTestWorker - process] ';
		
		// getting info about cred store for messages
		var conGr = new GlideRecord('em_connector_instance');
		if (!conGr.get(con_instance_id)) {
			this._setError(gs.getMessage('Invalid connector instance id: {0}', [con_instance_id]));
			return;
		}
		var con_instance_name = conGr.getValue('name');
		
		worker.setProgressState("running");
		this._addMessage(gs.getMessage('Starting connector test for: {0}', [con_instance_name]));
		
		// block multiple tests running
		conGr.setValue('running', true);
		conGr.setValue('last_status', 'None');  // start with a clean status
		conGr.update();
		
		// put an ecc probe
		var con = new ConnectorUtil();
		var eccId = con.writeToECC(conGr, true, agentName);
		if (gs.nil(eccId)) {
			this._setError(gs.getMessage('Cannot create a ecc entry for connector instance: {0}', [con_instance_name]));
			conGr.setValue('running', false);
			conGr.setValue('last_status', 'Error');
			conGr.update();
			return;
		}
		this._addMessage(gs.getMessage('Added test connection ECC probe'));
		
		// create a scheduled job to check the state
		var jobName = this.NAME_PREFIX + con_instance_name;
		
		//a jobname can't be more them 40 chars length
		jobName = jobName.substring(0, 40);
		
		this._createJob(eccId, jobName, conGr.sys_id);
		this._addMessage(gs.getMessage('Monitoring results from connector'));
		
		var pm = new GlideProgressMonitor(worker.getProgressID());
		var progress_state = pm.waitForCompletionOrTimeout(this.WAIT_TIME);
		if (!progress_state) {
			this._setError(gs.getMessage('Timed out for connector instance: {0}', [con_instance_name]));
			this._deleteJob(jobName);
			var gr = this._returnEccQueue(eccId);
			try{
				if (gr.next() && gr.state == 'processed') {
					var error_message = this._returnLastError(gr, conGr);
					conGr.setValue('last_error_message', error_message);
					this._addMessage(error_message);
				}
			}
			catch(e){
				var error_message = "Error during the payload processing - can't retrieve the last error";
				conGr.setValue('last_error_message', error_message);
				this._addMessage("Exception: " + error_message);
			}
			conGr.setValue('running', false);
			conGr.setValue('last_status', 'Error');
			conGr.update();
		}
	},
	_createJob : function(eccId, name, con_instance_id){
		//delete old ones
		this._deleteJob(name);
		
		// add one
		var jobs = new GlideRecord('sys_trigger');
		jobs.initialize();
		jobs.name = name;
		jobs.priority = 50;
		jobs.trigger_type = 1; //REPEAT
		jobs.state = 0; //READY
		var duration = new GlideDuration(this.INTERVAL);
		jobs.repeat = duration;
		jobs.run_count = this.RUN_COUNT;
		
		jobs.script = 'var tester = new EventManagementConnectorTestWorker(); ';
		jobs.script = jobs.script + "tester.checkQueue('"+ eccId + "','" + worker.getProgressID() +  "','"  + name +  "','" + con_instance_id + "' ); ";
		return jobs.insert();
		
	},
	// scheduled jobs calls this method periodically to check the results
	checkQueue: function (eccId, workerId, jobName, con_instance_id) {
		var description;
		var workerGr = new GlideRecord('sys_progress_worker');
		
		// if we could not put a ecc probe
		if (!workerGr.get(workerId)) {
			description = gs.getMessage("Cannot continue because there is no record for ecc entry: {0}", [mainId]);
			this._updateWorker(workerGr, description, 'error', 'error');
			this._deleteJob(jobName);
			return;
		}
		
		// if ecc is not there, something is wrong
		if (eccId == null) {
			description = gs.getMessage("Cannot continue because there is no ecc entry: {0}", [eccId]);
			this._updateWorker(workerGr, description, 'error', 'error');
			this._deleteJob(jobName);
			return;
		}
		
		// see if there is a response back
		var gr =  this._returnEccQueue(eccId);
		
		if (!gr.next()) {
			// no response yet, try again in the next cycle
			description = gs.getMessage("No response from connector yet");
			this._updateWorker(workerGr, description, null, null);
		}
		else{
			if (gr.state == 'ready' || gr.state == 'processing') {
				// we got the ecc input, but not processed by sensor yet
				// check in the next cycle
				description = gs.getMessage("Processing response from connector" );
				this._updateWorker(workerGr, description, null, null);
			}
			else if (gr.state == 'processed'){
				// ecc input is processed, check the result and quit.
				var instanceGr = new GlideRecord('em_connector_instance');
				
				if (!instanceGr.get(con_instance_id) ){
					// Not likely, but if the connector instance record was deleted.
					description = gs.getMessage("No connector instance record for id: {0}", [con_instance_id]);
					this._updateWorker(workerGr, description, 'error', 'error');
					this._deleteJob(jobName);
					return;
					
				}
				
				if (instanceGr.last_status == 'Success' || instanceGr.last_kpi_status == 'Success'){
					description = gs.getMessage("Connection test succeeded");
					this._updateWorker(workerGr, description, 'complete', 'success');
				}else {
					var error_message = this._returnLastError(gr, instanceGr);

					if (!error_message) {
						description = gs.getMessage('Unexpected error. Insufficient user permissions to access the connector instance from the MID Server may be the cause. Verify your permissions and run the connection test again.');
					} else {
						instanceGr.setValue('last_error_message', error_message);
						description = gs.getMessage("Connection test failed: " + error_message);
					}
					
					this._updateWorker(workerGr, description, 'complete', 'error');
				}
				this._deleteJob(jobName);
			}
			else {
				// ecc input record has error state...something went wrong, quit.
				description = gs.getMessage("An error occurred on ecc entry:{0}", [eccId] );
				this._updateWorker(workerGr, description, 'error', 'error');
				this._deleteJob(jobName);
			}
			
		}
	},
	_updateWorker:function(workerGr, description, state, stateCode) {
		var summary = workerGr.getValue('output_summary');
		
		if (summary == null) {
			summary = '';
		}
		workerGr.setValue('message', description);
		workerGr.setValue('output_summary', summary + description + '\n ');
		if (state != null) {
			workerGr.setValue('state', state);
			workerGr.setValue('state_code', stateCode);
		}
		workerGr.update();
		
	},	
	_deleteJob: function(jobName){
	
		//a jobname can't be more them 40 chars length
		var newName = jobName + "";
		newName = newName.substring(0, 40);
		
		var old = new GlideRecord('sys_trigger');
		old.addQuery('name', 'STARTSWITH', newName);		
		old.query();
		old.deleteMultiple();
	},
	_setError : function (msg) {
		msg += ": ";
		worker.setProgressState("error");
		worker.setProgressStateCode("error");
		this._addMessage(msg);
	},
	
	_addMessage : function (msg) {
		worker.addMessage(msg);
		
		var gr = new GlideRecord('sys_progress_worker');
		gr.get(worker.getProgressID());
		var summary = gr.getValue('output_summary');
		if (summary == null) {
			summary = '';
		}
		summary = summary + msg + '\n';
		worker.setOutputSummary(summary);
	},
	_returnEccQueue : function (eccId){
		var gr =  new GlideRecord('ecc_queue');
		gr.addQuery('queue', 'input');
		gr.addQuery('response_to', eccId);
		gr.query();
		return gr;
	},
	_returnLastError: function(gr, conGr){
		var json = SncProbe.getJsonPayload(gr);
		for (var i in json.parameters.parameter) {
			if (json.parameters.parameter[i]['@name'] == 'last_error_message') {
				var error_message = json.parameters.parameter[i]['@value'];
				return error_message;
			}
		}
	},
	type: 'EventManagementConnectorTestWorker'
};
