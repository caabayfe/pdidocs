(function executeRule(current, previous /*null when async*/ ) {
	/**
	 * Validates the interface-implementation binding.
	 * - WARNING: shows a warning message but allows the record to be created.
	 * - FAILURE: shows an error message and aborts the action.
	 */
    try {
        var validation_result = SNC.DataInterfaceAPI.validateBinding(current);
        var validation_result_json = JSON.parse(validation_result);

        if (validation_result_json.status == 'WARNING') {
            var msgs = validation_result_json.messages;
            for (var i = 0; i < msgs.length; i++)
                gs.addWarningMessage(gs.getMessage("Warning: {0}", [msgs[i]]));
        } else if (validation_result_json.status != 'SUCCESS') {
            gs.addErrorMessage(gs.getMessage("Invalid implementation for interface '{0}' (details: {1})",
				[current.interface, validation_result_json.message]));
            current.setAbortAction(true);
        }
    } catch (e) {
        gs.addErrorMessage(gs.getMessage('Unexpected implementation validation failure'));
        current.setAbortAction(true);
    }

})(current, previous);
