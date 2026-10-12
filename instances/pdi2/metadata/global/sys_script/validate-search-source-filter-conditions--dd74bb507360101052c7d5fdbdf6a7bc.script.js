(function executeRule(current, previous /*null when async*/ ) {

    var result = new sn_ais.AisUtil().canConvertToSearchFilter(current.source_table, current.condition, current.ais_search_source.datasource.source);
    if (result) {
        gs.addErrorMessage(gs.getMessage(result));
        current.setAbortAction(true);
    } else
        gs.addInfoMessage(gs.getMessage("save search source filter successfully"));
})(current, previous);
