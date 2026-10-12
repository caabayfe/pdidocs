(function executeRule(current, previous /*null when async*/) {
	GlidePropertiesDB.set('glide.ais.update_event_queue_writable_disabled_ts', new GlideDateTime().getValue()); // UTC timestamp		 
})(current, previous);
