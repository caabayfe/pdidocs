(function executeRule(current, previous /*null when async*/ ) {

    var masking_enabled = current.mask_sensitive_information;
    var masking_flow_selected = current.mask_agent_to_requester || current.mask_requester_to_agent || current.mask_requester_to_virtual_agent;

    //make sure atleast one masking flow is enabled if sensitive data handling is enabled on the instance
    if (masking_enabled && !masking_flow_selected) {
        gs.addErrorMessage(gs.getMessage("Atleast one masking flow should be selected"));
        current.setAbortAction(true);
    }

	//disable all the flows if masking is disabled
    if (!masking_enabled) {
        current.mask_agent_to_requester = false;
        current.mask_requester_to_agent = false;
        current.mask_requester_to_virtual_agent = false;
    }

})(current, previous);
