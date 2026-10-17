var EMRewriteDemoDataWorker = Class.create();
EMRewriteDemoDataWorker.prototype = {
	initialize: function() {
	},
	
	process: function(plugin_id) {
		try {
			this._addMessage(gs.getMessage('Starting to rewrite demo data for plugin {0}.', [plugin_id]));
			
			var tables = ['em_event', 'em_alert'];
			for (var i=0; i<tables.length; i++) {
				var gr = new GlideRecord(tables[i]);
				if (!gr.isValid()) {
					this._setError(gs.getMessage('{0} table does not exist. Please install {1}.', [tables[i], plugin_id]));
					return;
				}
			}
			
			var gdt = new GlideDateTime();
			
			var useCases = this._findNumberOfUseCases();
			
			for (var eachCase in useCases) {
				this._addMessage('Updating event and alert creation time for '+ eachCase);
				
				// Update the events
				var grEvent = new GlideRecord('em_event');
				grEvent.addQuery('source', eachCase);
				grEvent.query();
				while (grEvent.next()) {
					grEvent.sys_created_on = gdt.getDisplayValue();
					grEvent.update();
				}
				
				// update the alerts
				var grAlert = new GlideRecord('em_alert');
				grAlert.addQuery('source', eachCase);
				grAlert.query();
				while (grAlert.next()) {
					grAlert.sys_created_on = gdt.getDisplayValue();
					this.revertAlertState(grAlert);
					grAlert.update();
					this._addMessage('Updating alert creation time for '+ grAlert.source);
				}
				
				gdt.subtract(86400000); //1day
			}
			
			// fix link of services
			this.addVewServiceLink();
			
			this._addMessage(gs.getMessage('Finished rewriting demo data for plugin {0}.', [plugin_id]));
			worker.setProgressState("complete");
			
			var pm = new GlideProgressMonitor(worker.getProgressID());
			var progress_state = pm.waitForCompletionOrTimeout(this.WAIT_TIME);
			if (!progress_state) {
				this._setError(gs.getMessage('Timed out workflow: {0}.', [plugin_id]));
			}
			
		} catch (exception) {
			this.addMessage(exception);
		}
		return;
	},
	
	revertAlertState : function(grAlert){
		var work_note = this.getWorkNote(grAlert.sys_id);
		if (gs.nil(work_note))
			return;
		var gdt = work_note.sys_created_on;
		var oldState = this.getOldState(gdt,grAlert.sys_id);
		if (gs.nil(oldState))
			return;
		this.reopenIncident(grAlert);
		grAlert.state = oldState;
	},
	
	addVewServiceLink : function(grAlert){
		var service = new GlideRecord("cmdb_ci_service_auto"); 
		service.addNullQuery("view_service"); 
		service.query(); 
		while (service.next()){
			// set sys id of UI Action
			service.setValue("view_service","61e1cb757f23220002d31ccebefa9120"); 
			service.update(); 
		}
	},
	
	reopenIncident : function(grAlert){
		var incidentId = grAlert.incident;
		if (gs.nil(incidentId))
			return;
		var incident = new GlideRecord('incident');
		incident.get(incidentId);
		incident.state = '2';
		incident.update();
	},
	
	getOldState : function(gdt,dID){
		var audit = new GlideRecord('sys_audit');
		audit.addQuery('tablename','em_alert');
		audit.addQuery('fieldname','state');
		audit.addQuery('sys_created_on',gdt);
		audit.addQuery('documentkey',dID);
		audit.query();
		if (audit.next())
			return audit.oldvalue;
		return null;
	},
	
	getWorkNote: function(eID){
		var journal = new GlideRecord('sys_journal_field');
		journal.addQuery('name','em_alert');
		journal.addQuery('element','work_notes');
		journal.addQuery('element_id',eID);
		journal.orderByDesc('sys_created_on');
		journal.query();
		while(journal.next()){
			if (journal.value.indexOf('Alert is automatically closed') >= 0)
				return journal;
		}
		return null;
	},
	
	canShowAction : function() {
		var tables = ['em_event', 'em_alert'];
		for (var i=0; i<tables.length; i++) {
			var gr = new GlideRecord(tables[i]);
			
			if (!gr.isValid())
				return false;
			
			gr.addQuery('source', 'CONTAINS', '[Demo:');
			gr.query();
			if (gr.next()) {
				return true;
			}
			
			gr.initialize();
			gr.addQuery('source', 'ENDSWITH', 'CloudWatchDemoData');
			gr.query();
			if (gr.next()) {
				return true;
			}
		}
		return false;
	},
	
	_findNumberOfUseCases : function() {
		var useCases = {};
		var grEvent = new GlideRecord('em_event');
		grEvent.addQuery('source', 'CONTAINS', '[Demo:');
		grEvent.query();
		while (grEvent.next()) {
			useCases[grEvent.source] = '';
		}
		
		grEvent.initialize();
		grEvent.addQuery('source', 'ENDSWITH', 'CloudWatchDemoData');
		grEvent.query();
		while (grEvent.next()) {
			useCases[grEvent.source] = '';
		}
		
		grEvent.initialize();
		grEvent.addQuery('source', 'CONTAINS', 'SNC');
		grEvent.query();
		while (grEvent.next()) {
			useCases[grEvent.source] = '';
		}
				
		grEvent.initialize();
		grEvent.addQuery('source', 'ServiceWatch');
		grEvent.query();
		while (grEvent.next()) {
			useCases[grEvent.source] = '';
		}
		
		return useCases;
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
	
	WAIT_TIME : 30,
	type: 'EMRewriteDemoDataWorker'
};
