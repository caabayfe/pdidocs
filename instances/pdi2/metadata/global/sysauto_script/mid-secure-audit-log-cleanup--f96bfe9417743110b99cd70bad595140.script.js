(function() {
	var updateEccEntryOlderThanDays = 1;

	updateEccEntries(updateEccEntryOlderThanDays);

	var audit_result, source_type, source, mid_server, topic;
	var min_create_time, max_update_time, count;
	var dup_rec_sys_ids = [];
	var sorted_audit_records;
	deduplicateRecords();

	function deduplicateRecords() {
		sorted_audit_records = new GlideAggregate("ecc_agent_secure_access_audit_log");
		sorted_audit_records.addQuery("source_type", "!=", "ecc_queue");
		sorted_audit_records.groupBy("audit_result");
		sorted_audit_records.groupBy("source_type");
		sorted_audit_records.groupBy("source");
		sorted_audit_records.groupBy("topic");
		sorted_audit_records.groupBy("mid_server");
		sorted_audit_records.groupBy("sys_id");
		sorted_audit_records.groupBy("sys_created_on");
		sorted_audit_records.groupBy("sys_updated_on");
		sorted_audit_records.groupBy("count");
		sorted_audit_records.query();

		while (sorted_audit_records.next()) {
			if(audit_result != sorted_audit_records.audit_result || source_type != sorted_audit_records.source_type || source != sorted_audit_records.source || mid_server != sorted_audit_records.mid_server || topic != sorted_audit_records.topic)
				handleDuplicateEntries();

			dup_rec_sys_ids.push(sorted_audit_records.getValue("sys_id"));

			var create_time = new GlideDateTime(sorted_audit_records.sys_created_on);
			if(min_create_time.after(create_time))
				min_create_time = create_time;

			var update_time = new GlideDateTime(sorted_audit_records.sys_updated_on);
			if(max_update_time.before(update_time))
				max_update_time = create_time;

			count = count + sorted_audit_records.count;
		}

		handleDuplicateEntries();
	}

	function handleDuplicateEntries() {
		if (dup_rec_sys_ids.length > 1) {
			updateSingleRecord(dup_rec_sys_ids.pop(), min_create_time, max_update_time);
			deleteRecordsWithSysIds(dup_rec_sys_ids);
		}

		audit_result = sorted_audit_records.getValue("audit_result");
		source_type = sorted_audit_records.getValue("source_type");
		source = sorted_audit_records.getValue("source");
		mid_server = sorted_audit_records.getValue("mid_server");
		topic = sorted_audit_records.getValue("topic");
		dup_rec_sys_ids = [];
		min_create_time = new GlideDateTime(sorted_audit_records.sys_created_on);
		max_update_time = new GlideDateTime(sorted_audit_records.sys_updated_on);
		count = 0;
	}

	function updateSingleRecord(sys_id, create_time, update_time) {
		var updateRec = new GlideRecord("ecc_agent_secure_access_audit_log");
		updateRec.get('sys_id', sys_id);
		updateRec.autoSysFields(false);
		updateRec.setWorkflow(false);
		updateRec.sys_created_on = create_time;
		updateRec.sys_updated_on = update_time;
		updateRec.count = count;
		updateRec.update();
	}

	function deleteRecordsWithSysIds(sys_id_list) {
		var deleteRec = new GlideRecord("ecc_agent_secure_access_audit_log");
		deleteRec.addQuery("sys_id", "IN", sys_id_list.join(","));
		deleteRec.deleteMultiple();
	}

	function updateEccEntries(noOfDays) {
		var daysAgo = new GlideDateTime();
		daysAgo.addDays(noOfDays * -1);
		var gr = new GlideRecord('ecc_agent_secure_access_audit_log');
		gr.addQuery('source_type','ecc_queue');
		gr.addQuery('sys_updated_on','<',daysAgo.getValue());
		gr.setValue('source_type','none');
		gr.setValue('source','');
		gr.updateMultiple();
	}
})();
