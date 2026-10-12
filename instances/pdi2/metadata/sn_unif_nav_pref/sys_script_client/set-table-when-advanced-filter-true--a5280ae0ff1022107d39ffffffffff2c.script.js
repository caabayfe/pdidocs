function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var notif = new GlideRecord("sysevent_email_action");
    notif.addQuery("sys_id", g_form.getValue("notification"));
    notif.query(function() {
        if (notif.next()) {
			var value = notif.collection;
            if (g_form.getBooleanValue('advanced')) {
				g_form.setValue('collection', value);
				g_form.setReadOnly('collection', true);
			}
		}
	});
   
}
