(function executeRule(current, previous /*null when async*/) {
    function isValidJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    }

    if (!gs.nil(current.value) && current.value.changes() && !isValidJSON(current.value)) {
		gs.addErrorMessage(gs.getMessage("Invalid JSON format. The record will not be saved."));
        current.setAbortAction(true);
    }
})(current, previous);
