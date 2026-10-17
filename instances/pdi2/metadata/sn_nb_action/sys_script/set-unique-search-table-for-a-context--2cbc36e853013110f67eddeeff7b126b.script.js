(function executeRule(current, previous /*null when async*/ ) {
    if (!current.active)
        return;
    var context = current[sn_nb_action.Constants.COL_CONTEXT];
    var searchSourceTable = current[sn_nb_action.Constants.COL_SEARCH_SOURCE_TABLE];
    var searchSourceTableColumn = sn_nb_action.Constants.COL_SEARCH_SOURCE_TABLE;
    var geniusResultConfig = current[sn_nb_action.Constants.COL_GENIUS_RESULT_CONFIG];
    var geniusResultConfigColumn = sn_nb_action.Constants.COL_GENIUS_RESULT_CONFIG;
    var mapGeniusResult = current.map_genius_result;
    var gr = new GlideRecord(sn_nb_action.Constants.TBL_SEARCH_RESULT_RA_MAPPING);
    gr.addQuery('context', context);
    gr.addQuery('sys_id', '!=', current.sys_id.toString());
    gr.addQuery('map_genius_result', mapGeniusResult);
    gr.addActiveQuery();
    if (mapGeniusResult == sn_nb_action.Constants.CHOICE_YES) {
        gr.addQuery(geniusResultConfigColumn, geniusResultConfig);
    } else {
        gr.addQuery(searchSourceTableColumn, searchSourceTable);
    }
    gr.query();
    if (gr.hasNext() && current.active) {
        var message;
        current[sn_nb_action.Constants.COL_ACTION] = '';
        if (mapGeniusResult == sn_nb_action.Constants.CHOICE_YES)
            message = gs.getMessage("Mapping record already exists for the selected genius result configuration: {0} for this context. Select another configuration to proceed.", geniusResultConfig.name);
        else
            message = gs.getMessage("Mapping record already exists for the selected search source table: {0} for this context. Select another search source table to proceed.", searchSourceTable);
        gs.addErrorMessage(message);
        current.setAbortAction(true);
    }

})(current, previous);
