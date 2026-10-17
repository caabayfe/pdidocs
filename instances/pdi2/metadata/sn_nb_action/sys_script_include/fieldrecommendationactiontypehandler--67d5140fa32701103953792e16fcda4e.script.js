var FieldRecommendationActionTypeHandler = Class.create();
FieldRecommendationActionTypeHandler.prototype = Object.extendsObject(sn_nb_action.ActionTypeHandlerBase, {

    /*
     * This identifies the action type handled by this implementation.
     * Should be "sn_nb_action_type_definition.table_name"
     */
    getId: function() {
        return Constants.TBL_FIELD_RECOMMENDATION;
    },

    getCustomAttributes: function(currentRecord, actionRecord, actionInputs) {
        var fieldRecommendationService = new FieldRecommendationService(actionRecord);
        if (fieldRecommendationService.hasValidRecord()) {
            return fieldRecommendationService.getRecommendations(actionInputs) || {};
        } else {
            var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
            logger.error('Invalid field recommendation record');
            return {};
        }
    },

    /*
     * Returns true if the action is allowed for table
     */
    isActionAllowed: function(tableName, actionRecord) {
        var result = {};
        var fieldRecommendationTable = actionRecord.getValue(Constants.COL_TABLE);
        if (tableName == fieldRecommendationTable) {
            result[Constants.IS_ACTION_ALLOWED] = true;
        } else {
            result[Constants.IS_ACTION_ALLOWED] = false;
            result[Constants.ERROR_MESSAGE] = gs.getMessage("This field recommendation isn't set up to support the {0} context. Choose a different recommendation or reconfigure the current one.", [tableName]);
        }
        return result;
    },

    type: 'FieldRecommendationActionTypeHandler'
});
