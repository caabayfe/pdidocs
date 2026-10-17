(function executeRule(current, previous /*null when async*/ ) {
    var column = current.filter_column;
    var table = current.target_table;
	
	var smGlobal = new global.SMGlobal();
	var isPwd2 = smGlobal.isPwd2FieldHelper(table, column);

    if (isPwd2) {
        gs.addErrorMessage(gs.getMessage("The Secret Group couldn't be created because columns could not be filtered by password2 values"));
        current.setAbortAction(true);
    } else
		return;
})(current, previous);
