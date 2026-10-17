function onCondition() {
	var category = g_form.getValue('category');

	if (category == 'event')
		g_form.setValue('table', 'sysevent_event_stats');

	else if (category == 'handler')
		g_form.setValue('table', 'sysevent_handler_stats');

	else if (category == 'queue')
		g_form.setValue('table', 'sysevent_queue_stats');
}
