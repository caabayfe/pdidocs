if (GlideTableDescriptor.fieldExists('sys_cs_session_binding', 'last_client_activity_time') && GlideTableDescriptor.fieldExists('sys_cs_consumer', 'inactive')) {
	var sessionBindingGR = new GlideRecord('sys_cs_session_binding');
	var guestSessionTimeout = gs.getProperty("glide.guest.session_timeout", 30);
	var timeoutGuestSessionIdThreshold = new GlideDateTime();
	timeoutGuestSessionIdThreshold.addSeconds(-guestSessionTimeout * 60);
	
	// Only honor guest session timeout if it is positive
	if(guestSessionTimeout > 0) {
		sessionBindingGR.addQuery('guest', true);
		sessionBindingGR.addNotNullQuery('last_client_activity_time');
		sessionBindingGR.addQuery('last_client_activity_time', '<', timeoutGuestSessionIdThreshold.getValue());
		sessionBindingGR.orderByDesc('last_client_activity_time');
		sessionBindingGR.setLimit(1000);
		sessionBindingGR.query();
	
		while (sessionBindingGR.next()) {
			// These guest session bindings have been processed, so remove last client activity time
			// so that they do not get processed again
			sessionBindingGR.setValue('last_client_activity_time', '');
			sessionBindingGR.update();
			
			var interactionGR = new GlideRecord('interaction');
			interactionGR.addQuery('channel_metadata_document', sessionBindingGR.topic);
			// Only want to expire consumers for chat type channels 
			interactionGR.addQuery('type', '!=', 'messaging');
			interactionGR.query();
			
			if (interactionGR.next()) {
				var consumerGR = new GlideRecord('sys_cs_consumer');
				consumerGR.addQuery('sys_id', sessionBindingGR.session.consumer);
				consumerGR.addQuery('inactive', false);
				consumerGR.query();
			
				if (consumerGR.next()) {
					// Mark the consumer associated with guest session identifier as inactive
					consumerGR.setValue('inactive', true);

					// disable the cache flush before updating the record as with some customers every user is a
					// guest user and so this update is causing a lot of flushes on consumer cache resulting
					// in performance issues
					var oldIgnoreFlushValue = GlideSession.get().setCacheIgnoreFlushTable('sys_cs_consumer');
					try {
						consumerGR.update();
					} finally {
						GlideSession.get().setCacheIgnoreFlushTable(oldIgnoreFlushValue);
					}
				}
			}
		}
	}
}
