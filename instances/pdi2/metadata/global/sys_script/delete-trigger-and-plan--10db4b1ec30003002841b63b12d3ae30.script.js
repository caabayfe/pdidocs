(function executeRule(current, previous /*null when async*/) {
	var remoteTriggerId = current.remote_trigger_id;
	if (!remoteTriggerId || remoteTriggerId == "") {
		var triggerInstance = new GlideRecord("sys_hub_trigger_instance");
		if (!triggerInstance.get("flow", current.sys_id))
			return;

		remoteTriggerId = triggerInstance.remote_sys_id;
	}

    var planRecord = new GlideRecord("sys_flow_trigger_plan");
	planRecord.addQuery("trigger", remoteTriggerId);
	planRecord.addQuery("plan_id", current.sys_id);
	planRecord.query();
	if (planRecord.next()) {
		planRecord.deleteRecord();
	}

    var triggerRecord = new GlideRecord("sys_flow_trigger");
	if (triggerRecord.get(remoteTriggerId)) {
		var triggerClass = triggerRecord.getValue("sys_class_name");
		if (triggerClass == "sys_flow_record_trigger")
			sn_flow_trigger.FlowTriggerAPI.deleteRecordTrigger(current.sys_id);
		else if (triggerClass == "sys_flow_enhanced_timer_trigger")
			sn_flow_trigger.FlowTriggerAPI.deleteTimerTrigger(current.sys_id);
		else
			triggerRecord.deleteRecord();
	}

})(current, previous);
