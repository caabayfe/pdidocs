function onCondition() {
	var gr = new GlideRecord("em_alert_promotion_rule");
	gr.addQuery('sys_id',rowSysId);
	gr.query();
	if (gr.next()){
		gr.setValue('cmdb_ci', '');
		gr.setValue('metric_name', '');
		gr.setValue('promotion_type', '');
		gr.update();
	}
}
