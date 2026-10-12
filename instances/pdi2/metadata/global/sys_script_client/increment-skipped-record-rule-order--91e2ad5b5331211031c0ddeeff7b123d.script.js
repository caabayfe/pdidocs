function onLoad() {
   //Type appropriate comment here, and begin script below
   if(!g_form.isNewRecord()) {
		return;
   }
	
	var rules = new GlideRecord('sys_upgrade_skipped_record_rule');
	rules.setLimit(1);
	rules.orderByDesc('order');
	rules.query();
	rules.next();

	if(parseInt(rules.getValue('order'))) {
		g_form.setValue('order', parseInt(rules.getValue('order')) + 1);
	} else g_form.setValue('order', 100);
}
