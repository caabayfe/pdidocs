(function executeRule(current, previous /*null when async*/) {

	/*
	STRY53422744
	It is possible that a policy may have automatic subflow (e.x. retire subflow) 
	or manual process (e.x. manual attestation) or both. However, when creating or
	updating policy type metadata, we should not allow a policy to neither have a subflow
	nor a manual process, i.e. a policy that does nothing. Complete state permutation and 
	corresponding logic flow can be found in STRY53422744.
	*/
	
	if(current.is_subflow_optional.toString() === 'true' && current.has_manual_process.toString() === 'false'){
		gs.addErrorMessage(gs.getMessage("Policy must have either a subflow or manual process."));
		current.setAbortAction(true);
	}

})(current, previous);
