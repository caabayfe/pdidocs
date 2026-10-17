function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
var notif = new GlideRecord("sysevent_email_action");
	notif.addQuery("sys_id", g_form.getValue("notification"));
	notif.query(function() {
		if (notif.next())
			g_form.setValue("notification.collection",notif.collection);
	});
}
