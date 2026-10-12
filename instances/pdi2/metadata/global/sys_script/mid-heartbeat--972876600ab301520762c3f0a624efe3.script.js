doHeartbeat();

function doHeartbeat() {
    // mark the record processed...
    current.state = 'processed';
    var ecc_gr = new GlideRecord('ecc_queue');
    ecc_gr.addQuery('sys_id', '' + current.response_to);
    ecc_gr.query();
    if (ecc_gr.next()) {
        ecc_gr.state = 'processed';
        ecc_gr.update();
    }
    
    // update our MID server record...
    var mid = ('' + current.agent).substr('mid.server.'.length);
    var gr = new GlideRecord('ecc_agent');
    gr.addQuery('name', mid);
    gr.query();
    if (!gr.next())
        return;
    
    
    gr.setValue('last_refreshed', gs.nowNoTZ());

	// Since Vancouver, Heartbeat input record includes the operational status of the MID Server
	var midOperationalStatus = new ECCPayloadParser(current.payload).getParameters()['mid_operational_state'];
	if (midOperationalStatus) {
		gr.setValue("status", midOperationalStatus);
	} else {
		// The strings below correspond to the DBString for various ECCAgentOperationalState enum values. Noting this
		// so the next person not understanding why their operational state is mysteriously being updated on the 
		// instance can search for the enum name.
		var persistedStatuses = ['Paused', 'Upgrading', 'Upgrade Failed', 'Draining', 'Drained', 'Drain Failed'];
		if (persistedStatuses.indexOf('' + gr.status) == -1) {
			gr.status = 'Up';
		}
	}
	
    var user = GlideUser.getCurrentUser();
    if (JSUtil.notNil(user))
        gr.user_name = user.getName();
    gr.update();
}
