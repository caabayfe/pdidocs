(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var result = new sn_ais.AisUtil().canConvertToSearchFilter(current.datasource, current.condition, current.datasource);
    if (result) {
		gs.error(result);
        gs.addErrorMessage(gs.getMessage("Search Source condition could not be saved. See logs for details."));
        current.setAbortAction(true);
    } else
        gs.addInfoMessage(gs.getMessage("Search Source saved sucessfully"));
})(current, previous);
