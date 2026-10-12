(function executeRule(current, previous /*null when async*/) {
	var arrayUtil = new ArrayUtil();
    var script = new TableCleanerList();
    var tableList = script.process(); 
    if (!arrayUtil.contains(tableList, current.tablename)) {
        gs.addErrorMessage(gs.getMessage("Invalid 'Tablename' selected. '{0}' can not be cleaned with Table Cleaner.", [current.tablename]));
        current.setAbortAction(true);
    } 
})(current, previous);
