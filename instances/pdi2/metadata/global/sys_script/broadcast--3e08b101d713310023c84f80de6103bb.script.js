function onAfter(current, previous) {
	var attachmentsMoved = current.action == 'update' && current.has_attachments && current.has_attachments.changes();
	
	gs.print("broadcaster");
	
	if(!attachmentsPending(current) || attachmentsMoved)
	   new GlideLiveMessageBroadcaster().broadcastFromRecord(current)
}

function attachmentsPending(current) {
	var pendingAttachments = new GlideRecord("sys_attachment");
	pendingAttachments.addQuery("table_name", "live_profile");
	pendingAttachments.addQuery("table_sys_id", new GlideappLiveProfile().getID());
	pendingAttachments.query();
	
	return pendingAttachments.next();
}
