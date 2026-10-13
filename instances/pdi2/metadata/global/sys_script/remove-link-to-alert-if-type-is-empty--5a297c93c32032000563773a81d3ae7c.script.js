(function executeRule(current, previous /*null when async*/) {
	var alertGr = new GlideRecord("em_alert_anomaly");
	alertGr.addQuery('sys_id', current.alert);
	alertGr.query();
	while(alertGr.next()) {
		alertGr.setValue("promotion_rule", "");
		alertGr.update();
	}
	current.name = '';
	current.source = '';
	current.update();
})(current, previous);
