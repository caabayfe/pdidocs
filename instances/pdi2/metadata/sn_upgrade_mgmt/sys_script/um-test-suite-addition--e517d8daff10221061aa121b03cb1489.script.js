(function executeRule(current, previous /*null when async*/ ) {
    gs.info("Async Business Rule UM Test Suite Addition triggered on record update: " + current.sys_id);
    var boqId = current.getValue('sys_id');

    var tggr = new GlideRecord('sn_atf_tg_generated_test');
    tggr.addQuery('snboq', boqId);
    tggr.query();

    if (!tggr.next()) {
        gs.info("No matching Test Suite found for boqId: " + boqId);
        return;
    }

    var testSuite = tggr.getValue('suite');

    // Fetch SessionID
    var sessiongr = new GlideRecord('sn_um_upgrade_sessions');
    sessiongr.addQuery('atf_test_suite_generation_tracker', boqId);
    sessiongr.query();
    if (!sessiongr.next()) {
        gs.info("No matching Upgrade Session found for boqId: " + boqId);
        return;
    }
    var sessionId = sessiongr.getValue('sys_id');

	if(testSuite && sessionId){
		// Check if record already exists
		var existingTS = new GlideRecord('sn_um_upgrade_test_suites');
		existingTS.addQuery('upgrade_session_id', sessionId);
		existingTS.addQuery('atf_test_suite_id', testSuite);
		existingTS.query();

		if (existingTS.next()) {
			gs.info("Upgrade Test Suite record already exists for sessionId: " + sessionId + " and testSuite: " + testSuite);
			return;
		}

		var tsgr = new GlideRecord('sn_um_upgrade_test_suites');
	    	tsgr.addQuery('upgrade_session_id', sessionId);
	        tsgr.addQuery('atf_test_suite_id', testSuite);
	        tsgr.query();
	        if (tsgr.next()) {
	            return tsgr.getUniqueValue();
	        }
		tsgr.initialize();
		tsgr.setValue('upgrade_session_id', sessionId);
		tsgr.setValue('atf_test_suite_id', testSuite);
		tsgr.setValue('atf_generation_tracking_id', boqId);
		var newSysId = tsgr.insert();
		gs.info("New Upgrade Test Suite inserted with sys_id: " + newSysId);
	}


})(current, previous);
