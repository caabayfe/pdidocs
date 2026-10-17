(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage("Text index configuration for table : {0} can not be created for format : {1}. It is not supported for v1 and v2 formats.", [current.table, current.format]));
	current.setAbortAction(true);

})(current, previous);
