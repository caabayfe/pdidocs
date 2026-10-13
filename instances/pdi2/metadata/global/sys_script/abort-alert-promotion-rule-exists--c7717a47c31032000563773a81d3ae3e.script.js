(function executeRule(current, previous /*null when async*/) {
	var otherRule = new GlideRecord("em_alert_promotion_rule");
	if (current.name != null){
		otherRule.addQuery("name", current.name);
		otherRule.query();
		if (otherRule.next() && otherRule.sys_id != current.sys_id){
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Alert promotion rule with the same name already exists"));
			return;
		}
	}
	if (current.type == "1"){
		otherRule.addQuery("type", "1");
		otherRule.addQuery("metric_name", current.metric_name);
		otherRule.addQuery("source", current.source);
		otherRule.query();
		if (otherRule.next() && otherRule.sys_id != current.sys_id){
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Alert promotion rule for the same metric name already exists"));		
	}
		return;
	}
	if (current.type == "2"){
			otherRule.addQuery("type", "2");
			otherRule.addQuery("ci_type", current.ci_type);
		    otherRule.addQuery("source", current.source);
			otherRule.query();
			if (otherRule.next() && otherRule.sys_id != current.sys_id){
				current.setAbortAction(true);
				gs.addInfoMessage(gs.getMessage("Alert promotion rule for the same ci_type already exists"));	
			}
		return;	
	}
	if (current.type == "3"){
			otherRule.addQuery("type", "3");
			otherRule.addQuery("cmdb_ci", current.cmdb_ci);
		    otherRule.addQuery("source", current.source);
			otherRule.query();
			if (otherRule.next() && otherRule.sys_id != current.sys_id){
				current.setAbortAction(true);
				gs.addInfoMessage(gs.getMessage("Alert promotion rule for the same configuration item already exists"));	
			}
		return;
	}
	if (current.type == "4"){
			otherRule.addQuery("type", "4");
			otherRule.addQuery("promotion_parameter", current.promotion_parameter);
		    otherRule.addQuery("source", current.source);
			otherRule.query();
			if (otherRule.next() && otherRule.sys_id != current.sys_id){
				current.setAbortAction(true);
				gs.addInfoMessage(gs.getMessage("Alert promotion rule with the same regex for the promotion parameter field already exists"));	
			}		
	}
})(current, previous);
