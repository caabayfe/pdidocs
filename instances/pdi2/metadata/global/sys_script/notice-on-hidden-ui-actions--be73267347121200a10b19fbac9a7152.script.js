(function executeRule(current, previous /*null when async*/) {
	if(current.remote_base_update_set.nil()) {
		var commitUnavailable = new UpdateSetCommitVisible().shouldInformMissing(current);
		if (commitUnavailable) {
			informMissingUIActions();
			return;
		}

		var previewUnavailable = new UpdateSetPreviewVisible().shouldInformMissing(current);
		if (previewUnavailable) {
			informMissingUIActions();
			return;
		}

		var previewAgainUnavailable = new UpdateSetPreviewAgainVisible().shouldInformMissing(current);
		if (previewAgainUnavailable) {
			informMissingUIActions();
			return;
		}
	}
	else {
		var hierarchyCommitUnavailable = new UpdateSetHierarchyCommitVisible().shouldInforMissing(current);
		if (hierarchyCommitUnavailable) {
			informMissingUIActions();
			return;
		}
		
		var hierarchyPreviewUnavailable = new UpdateSetHierarchyPreviewVisible().shouldInformMissing(current);
		if (hierarchyPreviewUnavailable) {
			informMissingUIActions();
			return;
		}

		var hierarchyPreviewAgainUnavailable = new UpdateSetHierarchyPreviewAgainVisible().shouldInformMissing(current);
		if (hierarchyPreviewAgainUnavailable) {
			informMissingUIActions();
			return;
		} 
	}

})(current, previous);

function informMissingUIActions() {
	// If the mutex is available, then the system is upgrading
	if (SNC.UpdateMutex.isAvailable())
		gs.addInfoMessage(gs.getMessage("Update set preview and commit are unavailable because the system is currently upgrading. <a href=\"$upgrade_client.do\">Click here</a> for the Upgrade Monitor"));
	else {
		//Notify on the current running mutex operation
		var currMsg = SNC.UpdateMutex.getCurrentMutexMessage();
		gs.addInfoMessage(gs.getMessage("Update set preview and commit are unavailable because another operation is running: {0}", [currMsg]));
	}
}
