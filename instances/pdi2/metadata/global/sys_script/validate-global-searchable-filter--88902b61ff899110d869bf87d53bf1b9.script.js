(function executeRule(current, previous /*null when async*/ ) {

    var tableName = current.name.split(".").pop();
    var errorMessage = new sn_ais.AisUtil().canConvertToSearchFilter(tableName, current.value);

    if (errorMessage) {
        gs.error(errorMessage);
        gs.addErrorMessage(gs.getMessage("Global Searchable Documents Filter could not be saved. See logs for details."));
        current.setAbortAction(true);
    } else
        gs.addInfoMessage(gs.getMessage("Global Searchable Documents Filter saved successfully."));

})(current, previous);
