try {
	if (!pm.isZboot()) {
		gs.log('Updating label');
		var glideRecord = new GlideRecord('sys_db_object');
		glideRecord.addQuery('name', '=', 'sys_pd_context');
		glideRecord.addQuery('label', '=', 'Process Executions');
		glideRecord.query();
		if (glideRecord.next()) {
			glideRecord.setValue('label', 'Playbook Executions');
			glideRecord.update();
			gs.info("Label updated for sys_pd_context to Playbook Executions");
		}
		else {
			gs.log("Record not found to update the label of sys_pd_context");
		}

		var glideRecord_chunk = new GlideRecord('sys_db_object');
		glideRecord_chunk.addQuery('name', '=', 'sys_pd_context_chunk');
		glideRecord_chunk.addQuery('label', '=', 'Process Execution Archive Chunk');
		glideRecord_chunk.query();
		if (glideRecord_chunk.next()) {
			glideRecord_chunk.setValue('label', 'Playbook Execution Archive Chunk');
			glideRecord_chunk.update();
			gs.info("Label updated for sys_pd_context_chunk to Playbook Execution Archive Chunk");
		}
		else {
			gs.log("Record not found to update the label of sys_pd_context_chunk");
		}
	}
}

catch (ex) {
	gs.log("Update failed for context tables " + JSON.stringify(ex));
}
