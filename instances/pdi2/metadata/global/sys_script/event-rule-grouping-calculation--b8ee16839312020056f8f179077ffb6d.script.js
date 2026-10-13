(function executeRule(current, previous /*null when async*/) {

	var ruleCalcGr = new GlideRecord('em_event_rule_calculation');
	ruleCalcGr.addQuery('name', 'empty_events_calculation');
	ruleCalcGr.query();
	ruleCalcGr.next();
	if (ruleCalcGr.getValue("value") == '1') //if 'empty_events_calculation' is set to true - return
		return;
	
	var doneCalcEvents = false;
	if (current.name == "empty_events_calculation" && current.value == "0") { //value of current must be 0 according to the previous 'if'
		//done calculating event rules for empty events
		doneCalcEvents = true;
	}
	
	gr = new GlideRecord('em_event_rule_calculation');
	gr.addQuery('name', 'event_rule_start_updated');
	gr.query();
	gr.next();
	var shouldApply = gr.getValue('value');
	if (shouldApply === '1' || doneCalcEvents) {
		gr.setValue('value', '0');
		gr.update();
		
		var mutex = new GlideMutex('Event rule grouping calculation business rule');
		mutex.setMaxSpins(0);
		mutex.setMutexExpires(1000 * 60 * 60);
		if (mutex.get()) {
			try {
				var erm = new SNC.EventRuleManager();
				erm.calcEventGrouping();
			} finally {
				mutex.release();
			}

		}
	
	}
	
})(current, previous);
