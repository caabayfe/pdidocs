var EvtMgmtKBHandler = Class.create();
EvtMgmtKBHandler.prototype = {
	initialize: function() {
	},
	
	type: 'EvtMgmtKBHandler'
};

/*
 * Locate em_alert_rule record set KB reference
 * @param alert - alert
 */
EvtMgmtKBHandler.setKB = function(alert) {
	var mutex = new GlideSelfCleaningMutex('alert_'+alert.sys_id, 'EvtMgmtKBHandler');
	mutex.get();
	try {
		var gr = new GlideRecord("em_alert");
		gr.get(alert.sys_id);
		if (gr.getValue("kb") !== null && gr.getValue("acknowledged") === "1")
			return false;
		
		var kbWasFound = 0;
		var ackWasFound = 0;
		var rules = EvtMgmtKBHandler.locateRule(gr);
		//Scan each rule for both knowledge article and auto acknowledge and update the rule accordingly
		while (rules.next() && (!kbWasFound || !ackWasFound)) {
			if (kbWasFound === 0 && gr.getValue("kb") == null && rules.getValue("kb") !== null) {	
				if (GlideFilter.checkRecord(alert, rules.getValue("alert_filter"))) {
					gr.setValue("kb", rules.getValue("kb"));
					kbWasFound = 1;
				}
			}
			if (ackWasFound === 0 && rules.getValue("auto_ack") === "1" && gr.getValue("acknowledged") === "0" ) {
				if (GlideFilter.checkRecord(gr, rules.getValue("alert_filter"))) {
					gr.setValue("acknowledged", "1");
					ackWasFound = 1;
				}
			}
		}
		if (kbWasFound || ackWasFound) {
			gr.update();
			return true;
		}
		return false;
	} finally {
		mutex.release();
	}
	
};


EvtMgmtKBHandler.locateRule = function(alert) {
	//Search for alert rules with exist knowledge article or 'auto acknowledge' flag marked as true
	var gr = new GlideRecord("em_alert_rule");
	gr.addActiveQuery();
	gr.orderBy('order');
	var qc = gr.addNotNullQuery('kb');
	qc.addOrCondition('auto_ack', 'true');
	
	gr.query();
	return gr;
};
