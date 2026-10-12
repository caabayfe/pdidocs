(function executeRule(current, previous /*null when async*/) {

	if (current.getRecordClassName() == "sys_sg_navigation_section") {
		if (current.orientation == "vertical") 
			verifySectionCounts(current);	
		else 
			verifyNoCounts(current);
		
		
	} else if (current.getRecordClassName() == "sys_sg_item_section") 
		verifySectionCounts(current);
	else 
		verifyNoCounts(current);	
	
})(current, previous);


function verifySectionCounts(current) {
	if (current.orientation == "vertical") 
		verifyVerticalSectionCounts(current, 3);
	else
		verifyHorizontalSectionCounts(current, 3);	
}

function verifyVerticalSectionCounts(current, maxCount) {
	var MAX_WIDE_COL_COUNT = 4; // special case
	if (current.column_count != 0 && current.column_count > maxCount) {
		gs.addErrorMessage(gs.getMessage('Error: Illegal column count value.'));
		current.setAbortAction(true);									
	}
	if (current.wide_column_count != 0 && current.wide_column_count > MAX_WIDE_COL_COUNT) {
		gs.addErrorMessage(gs.getMessage('Error: Illegal wide column count value.'));
		current.setAbortAction(true);									
	}
	
	if (current.row_count != 0) {
		gs.addErrorMessage(gs.getMessage('Error: row count cannot be set for vertical section.'));
		current.setAbortAction(true);									
	}

	if (current.wide_column_count > 0 && current.column_count > current.wide_column_count) {
		gs.addErrorMessage(gs.getMessage('Error: column count cannot exceed wide column count.'));
		current.setAbortAction(true);										
	}	
}

function verifyHorizontalSectionCounts(current, maxCount) {
	if (current.row_count != 0 && current.row_count > maxCount) {
		gs.addErrorMessage(gs.getMessage('Error: Illegal row count value.'));
		current.setAbortAction(true);									
	}	
	
	if (current.column_count != 0) {
		gs.addErrorMessage(gs.getMessage('Error: column count cannot be set for horizontal section.'));
		current.setAbortAction(true);									
	}
	if (current.wide_column_count != 0) {
		gs.addErrorMessage(gs.getMessage('Error: wide column count cannot be set for horizontal section.'));
		current.setAbortAction(true);									
	}		
}

function verifyNoCounts(current) {
	if (current.row_count != 0 || current.column_count != 0 || current.wide_column_count != 0) {
		gs.addErrorMessage(gs.getMessage('Error: Row/column counts are not allowed for this section.'));
		current.setAbortAction(true);							
	}
}
