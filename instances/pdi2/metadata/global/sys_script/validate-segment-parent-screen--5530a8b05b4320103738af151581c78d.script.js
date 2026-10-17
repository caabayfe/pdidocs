(function executeRule(current, previous /*null when async*/) {

	var util = new LocationItemStreamUtil();
	var segment = new GlideRecord("sys_sg_item_stream_m2m_segment");
	segment.addQuery("item_stream", current.getUniqueValue());
	segment.query();

	while(segment.next()) {
		var isValid = util.areSegmentParentScreensValid(segment, current);
		if(!isValid) {
			current.setAbortAction(true);
			break;
		}
	}
	
})(current, previous);
