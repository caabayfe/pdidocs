(function executeRule(current, previous /*null when async*/) {
	// Use the event's bucket value if it exists, taking the property into consideration
	var eventBucket = current.getValue('bucket');
	if (GlideStringUtil.notNil(eventBucket)) {
		var ignoreEventBucket = gs.getProperty('evt_mgmt.ignore_event_bucket', false);		
		eventBucket = parseInt(Number(eventBucket), 10);
		
		if ((String(ignoreEventBucket) === 'false') && !isNaN(eventBucket)) {
			return eventBucket;
		}
	}
	
	var str = current.message_key + "";
 	if (!str || 0 === str.length)
 		str = current.source + '-' + current.node + '-' + current.type + '-' + current.resource;

	current.bucket = SNC.EventManagementScriptableApis.calculateBucket(str, current.classification);
})(current, previous);
