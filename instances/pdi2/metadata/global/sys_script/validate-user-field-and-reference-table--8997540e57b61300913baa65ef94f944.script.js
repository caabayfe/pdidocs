(function executeRule(current, previous /*null when async*/) {

	var abortTransaction = false;
	if(current.attrs.primary_user && current.attrs.primary_user != "") {
		var primary_user_attr = current.attrs.primary_user;
		var primary_ref_table_attr = current.attrs.primary_reference_table;
				
		var gr = new GlideRecord(current.getValue("table"));
		var table_column_name_primary = gr.getElement(primary_user_attr).getReferenceTable();
		if(table_column_name_primary != primary_ref_table_attr) {
			gs.addErrorMessage(gs.getMessage("Primary reference table and primary user should refer to the same table"));
			abortTransaction = true;
		}
		
	}
	
	if(current.attrs.secondary_user && current.attrs.secondary_user != "") {
		var secondary_user_attr = current.attrs.secondary_user;
		var secondary_ref_table_attr = current.attrs.secondary_reference_table;
		
		var grs = new GlideRecord(current.getValue("table"));
		var table_column_name_secondary = grs.getElement(secondary_user_attr).getReferenceTable();
		if(table_column_name_secondary != secondary_ref_table_attr) {
			gs.addErrorMessage(gs.getMessage("Secondary reference table and secondary user should refer to the same table"));
			abortTransaction = true;
		}
	}
        if(abortTransaction == true) {	
		current.setAbortAction(true);
	}
})(current, previous);
