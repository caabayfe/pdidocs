(function executeRule(current, previous /*null when async*/ ) {
    try {
        var tableChangeErrorMessage = gs.getMessage("Table change is not allowed as changing the table will make dependent configuration invalid");
        if (current.table.changes()) {
            throw tableChangeErrorMessage;
        }

        if (current.report_source.changes() && !gs.nil(current.report_source) && current.table != current.report_source.table) {
            throw tableChangeErrorMessage;
        }
		
		if (current.external_dataset.changes() && !gs.nil(current.external_dataset) && current.table != current.external_dataset.case_table) {
            throw tableChangeErrorMessage;
        }
    } catch (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
        gs.setRedirect(current);
    }
})(current, previous);
