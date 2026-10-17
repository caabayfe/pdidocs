(function() {

    var agentSysIds = [];
    var credSysIds = [];
	findAgentSysIds();
	findCredSysIds();
    findAndDeleteInvalidRecords();

	function findAgentSysIds() {
		var gr = new GlideAggregate('ecc_agent');
		gr.groupBy('sys_id');
		gr.query();
		while (gr.next())
			agentSysIds.push(gr.sys_id + '');
	}

	function findCredSysIds() {
		var gr = new GlideAggregate('discovery_credentials');
		gr.groupBy('sys_id');
		gr.query();
		while (gr.next())
			credSysIds.push(gr.sys_id + '');
	}

    function findAndDeleteInvalidRecords() {
		var done = false;

		while (!done) {
			var gr = new GlideRecordSecure('dscy_credentials_affinity');
			gr.addQuery('agent', 'NOT IN', agentSysIds);
			gr.setLimit(1000);
			// deleteMultiple() returns the number of rows deleted
			gr.deleteMultiple();
			done = !gr.getRowCount();
		}

		done = false;

		while (!done) {
			gr = new GlideRecordSecure('dscy_credentials_affinity');
			gr.addQuery('credential_id', 'NOT IN', credSysIds);
			gr.setLimit(1000);
			gr.deleteMultiple();
			done = !gr.getRowCount();
		}
    }

})();
