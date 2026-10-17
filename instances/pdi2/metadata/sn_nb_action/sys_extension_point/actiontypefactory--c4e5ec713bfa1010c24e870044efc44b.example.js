var CustomActionHandler = Class.create();
CustomActionHandler.prototype = Object.extendsObject(sn_nb_action.ActionTypeHandlerBase, {
    initialize: function() {},

    /*
     * This identifies the action type handled by this implementation.
     * Should be "sn_nb_action_type_definition.table_name"
     */
    getId: function() {},

    /*
     * This function is called by Recommended Action (RA) framework to initiate an action.
     * Invocation of this function indicates user started using the action. JSON Object
     * returned by this method is persisted and passed as an attribute to the action type
     * renderer and in all the future interactions.
     */
    initializeAction: function(currentRecord, actionRecord, actionDetailRecord) {},

    /*
     * This should return title of a given action. This is to help provide
     * dynamic title based on the current and action record. Same action
     * for different current records may return different titles.
     */
    getTitle: function(currentRecord, actionRecord) {},

    /*
     * This should return description of a given action. This is to help provide
     * dynamic descriptions based on the current and action record. Same action
     * for different current records may return different descriptions.
     */
    getDescription: function(currentRecord, actionRecord) {},

    /*
     * Returns true if the action is allowed for table
     */
    isActionAllowed: function(tableName, actionRecord) {
        // Add appropriate validation here
        return true;
    },

    /**
    * This method would update the action inputs when drill down actions are triggered
    */
    updateActionInputs: function(actionInputs, recommender, recommendedBy) {},

    type: 'CustomActionHandler'
});
