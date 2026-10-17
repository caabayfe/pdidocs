(function executeRule(current, previous /*null when async*/) {

	// Ignored Update sets cannot be intermixed within a batch.
	// They can be the batch base (and therefore won't transfer)
	if (!current.parent.nil()) {
		gs.addInfoMessage(gs.getMessage('Removing update set "{0}" from batch because ignored update sets cannot be in a batch', current.name));
		current.parent = "";
	}

})(current, previous);
