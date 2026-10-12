(function executeRule(current, previous /*null when async*/) {
	// Don't run on deletes
	if (typeof sn_remote_update_set_delete != "undefined") {
		if (sn_remote_update_set_delete == "true")
			return;
	}
	
	// Run the previewer on the batch that this update set joined
	// or for the update set by itself
	var autoPreview = new UpdateSetAutoPreview();
	autoPreview.preview(current);
	
	if (previous.parent.nil())
		return;
	
	var previousParent = new GlideRecord("sys_remote_update_set");
	previousParent.get(previous.parent);
	if (!previousParent.isValidRecord())
		return;
	
	// Run the previewer for the previous batch that this update
	// was part of
	autoPreview.preview(previousParent);
	
})(current, previous);
