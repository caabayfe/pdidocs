var NextBestActionRefQualifiersImpl = Class.create();
NextBestActionRefQualifiersImpl.prototype = {
    initialize: function() {},

    /*
     * Query to filter decision table records based on the action type of Decision Table Next Best Action Rule
     */
    getDecisionTablesQuery: function(ruleRecord) {
        var gr = new GlideRecordSecure(sn_nb_action.Constants.TBL_DECISION_TABLE);
        var actionTypeRecord = ruleRecord[sn_nb_action.Constants.COL_ACTION_TYPE].getRefRecord();
        var tablename = actionTypeRecord.getValue(sn_nb_action.Constants.COL_TABLE_NAME);
        if (NextBestActionUtil.isValidString(tablename)) {
            gr.addQuery(sn_nb_action.Constants.COL_ANSWER_TABLE, tablename);
        } else {
            gr.addQuery(sn_nb_action.Constants.COL_ANSWER_TABLE, '-1');
        }
        return gr.getEncodedQuery();
    },

    /*
     * Query to filter action input generator when selecting from a Recommended Action Record
     */
    getActionInputGenerator: function(recommendedAction) {
        var gr = new GlideRecordSecure(sn_nb_action.Constants.TBL_ACTION_INPUT_GENERATOR);
        var action = recommendedAction.getValue(sn_nb_action.Constants.COL_ACTION);
        var context = recommendedAction[sn_nb_action.Constants.COL_RULE][sn_nb_action.Constants.COL_RULE_CONTEXT][sn_nb_action.Constants.COL_CONTEXT] + '';
        var hierarchyTables = new GlideTableHierarchy(context);
        var tables = hierarchyTables.getTables();
        if (NextBestActionUtil.isValidString(action) && NextBestActionUtil.isValidString(context)) {
            gr.addQuery(sn_nb_action.Constants.COL_CONTEXT_TABLE, tables);
            gr.addQuery(sn_nb_action.Constants.COL_ACTION, action);
        } else
            gr.addQuery(sn_nb_action.Constants.COL_ACTION, -1);
        return gr.getEncodedQuery();
    },

    /*
    * Query to filter genius result config based on search application configuration
    */
   fetchGeniusResultConfiguration: function(searchActionMapRecord) {
       var geniusResultConfigSysIds = [];
       var gr = new GlideRecord(sn_nb_action.Constants.TBL_SEARCH_PROFILE_GENIUS_RESULT_MAPPING);
       gr.addQuery(sn_nb_action.Constants.COL_PROFILE, searchActionMapRecord.context.search_application_configuration.search_profile);
       gr.query();
       while (gr.next()) {
           geniusResultConfigSysIds.push(gr.getValue(sn_nb_action.Constants.COL_GENIUS_RESULT_CONFIG));
       }
       var geniusResultConfigGr = new GlideRecord(Constants.TBL_GENIUS_RESULT_CONFIGURATION);
       geniusResultConfigGr.addQuery('sys_id', 'IN', geniusResultConfigSysIds);
       return geniusResultConfigGr.getEncodedQuery();
   },

    type: 'NextBestActionRefQualifiersImpl'
};
