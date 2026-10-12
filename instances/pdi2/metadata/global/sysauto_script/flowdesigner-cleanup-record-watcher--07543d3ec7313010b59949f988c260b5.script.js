
			
			cleanOrphanRWForFlows()

			function cleanOrphanRWForFlows() {
			if ('system' != gs.getUserID()) {
			 gs.error("JOB FlowDesigner : Cleanup Record watcher  not running as SYSTEM. Contact System Administrator.");
				return;
			}
			var deleteSize = 100;
			var ids = [];
			var recordWatcher = new GlideRecord("sys_rw_action");
			recordWatcher.addEncodedQuery("action_prefixSTARTSWITHflow.^context!=NULL");
			recordWatcher.setWorkflow(false);
			recordWatcher.query();


			var flowContext = new GlideRecord("sys_flow_context");

			while(recordWatcher.next()){
			try {
			var flow_context_metaData = JSON.parse(recordWatcher.getValue("context"));
			 if(flow_context_metaData.sys_flow_context){
			   flowContext.initialize();
			   flowContext.setWorkflow(false);
			   flowContext.get(flow_context_metaData.sys_flow_context);

			   if(!flowContext.isValidRecord() || (flowContext.getValue("state") === "COMPLETE" || flowContext.getValue("state") === "CANCELLED" || flowContext.getValue("state") === "ERROR")){
				   gs.info("Found orphan RW records, Deleting RW for flow context "+ flow_context_metaData.sys_flow_context);
				   ids.push(recordWatcher.sys_id.toString());
				   if (ids.length >= deleteSize) {
					 deleteChunks(ids);
					ids = [];
					}
				}
			  }
			  } catch (err) {
			   gs.error("Error in FlowDesigner : Cleanup Record watcher, sys_rw_action sys_id "+recordWatcher.sys_id +" . Error is "+err.message);
			  }
			}

			if (ids.length > 0) {
			 deleteChunks(ids);
			}
			}

			function deleteChunks(ids) {
			  var chunks = new GlideRecord('sys_rw_action');
			  chunks.addQuery('sys_id', 'IN', ids.join(','));
			  chunks.deleteMultiple();
			}
