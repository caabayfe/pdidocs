var tables = new PAUtils().getTableAncestors(current.cube.facts_table);

var found = false; 
for (var i=0; i<tables.length; i++) {
	if (current.script.table == tables[i]) {
		found = true;
	    break;
	}
}
	
if (!found) {
	gs.addErrorMessage(gs.getMessage("Indicator Source Facts table and Script Facts table must have the same value"));
	current.setAbortAction(true);
}
