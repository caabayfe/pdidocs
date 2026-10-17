(function executeRule(current, previous /*null when async*/) {
	validateTableType();
	validateTableEmpty();
})(current, previous);

/**
 * The table cannot be a data fabric table, document table, or remote table.
 */
function validateTableType() {
	var incompatible_table_type;

	if (current.is_df_table) {
		incompatible_table_type = "Data Fabric Table";
	} else if (current.is_document_table) {
		incompatible_table_type = "Document Table";
	} else if (current.scriptable_table) {
		incompatible_table_type = "Remote Table";
	}

	if (incompatible_table_type) {
		abortWithErrorMessage(gs.getMessage("'{0}' ({1}) is a {2} and cannot be a data interface", [current.label, current.name, incompatible_table_type]));
	}
}

/**
 * is_data_interface can be set to true for an update only if the table is empty.
 */
function validateTableEmpty() {
	if (current.operation() == "insert")
		return;

	var gr = new GlideRecord(current.name);
	gr.setLimit(1);
	gr.query();
	if (gr.next()) {
		abortWithErrorMessage(gs.getMessage("'{0}' ({1}) cannot be a data interface because it is not empty", [current.label, current.name]));
	}
}

function abortWithErrorMessage(errorMsg) {
	gs.addErrorMessage(errorMsg);
	current.is_data_interface = false;
	current.setAbortAction(true);
}
