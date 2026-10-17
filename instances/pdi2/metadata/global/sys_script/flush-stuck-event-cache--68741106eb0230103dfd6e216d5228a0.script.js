(function executeRule(current, previous /*null when async*/) {
	GlideCacheManager.flush('sysevent_queue_stuck_states');
})(current, previous);
