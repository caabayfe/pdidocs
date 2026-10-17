(function executeRule(current, previous /*null when async*/) {
	/**
	 * Re-validates the interface-implementation binding on form load.
	 * - WARNING: shows a warning message (missing fields that need mappings/transforms).
	 * - FAILURE: shows an error message (type/reference mismatch or other hard error).
	 * - SUCCESS: no message.
	 */

	if (current.isNewRecord()) 
		return;

    try {
        var validation_result = SNC.DataInterfaceAPI.validateBinding(current);
        var validation_result_json = JSON.parse(validation_result);

        if (validation_result_json.status == 'WARNING') {
            var msgs = validation_result_json.messages;
            for (var i = 0; i < msgs.length; i++)
                gs.addWarningMessage(gs.getMessage("Warning: {0}", [msgs[i]]));
        } else if (validation_result_json.status != 'SUCCESS') {
            gs.addErrorMessage(gs.getMessage("Validation failed: {0}", [validation_result_json.message]));
        }
    } catch (e) {
        // Silently ignore — don't block form display for validation errors
    }
})(current, previous);
