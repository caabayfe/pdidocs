var ActionTypeHandlerBase = Class.create();
ActionTypeHandlerBase.prototype = {

    /*
     * This identifies the action type handled by this implementation.
     * Should be "sn_nb_action_type_definition.table_name"
     */
    getId: function() {
        //No Op - Should be overriden by an extension
    },

    /*
     * This function is called by Recommended Action (RA) framework to execute a single click action.
     * Invocation of this function indicates user started the execution of the action. 
     */
    executeAction: function(currentRecord, actionRecord, actionInputs, recommender, recommendedBy, actionMetadata) {
        //No Op - Should be overriden by an extension
    },

    /*
     * This function is called by Recommended Action (RA) framework to initiate an action.
     * Invocation of this function indicates user started using the action. JSON Object
     * returned by this method is persisted and passes as an attribute to the action type
     * renderer.
     */
    initializeAction: function(currentRecord, actionRecord, actionInputs, recommender, recommendedBy) {
        //No Op - Should be overriden by an extension
    },
    
	/*
     * This should return title of a given action. This is to help provide
     * dynamic title based on the current and action record. Same action
     * for different current records may return different titles.
     */
    getTitle: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        //No Op - Should be overriden by an extension
    },
    
	/*
     * This should return description of a given action. This is to help provide
     * dynamic descriptions based on the current and action record. Same action
     * for different current records may return different descriptions.
     */
    getDescription: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        //No Op - Should be overriden by an extension
    },
    
	/*
     * This should return the additional fields specific to a given action type. 
     */
    getCustomAttributes: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        //No Op - Should be overriden by an extension
    },

    /*
     * This should return if the recommended action should be hidden or not from the user
     * based on the states and checkbox value.
     */
    hideRecommendation: function(stateAttributesList, actionRecord) {
        return false;
    },

    /*
     * This should check whether the recommendation is allowed to hide or not
     * params consists of attributes:which is an object storing 'state' and parent hash id of recommendation
     * and section: to identify if card is in 'current' or 'history' section
     */
   isRAHideEligible: function(attributes, section) {
       return false;
   },
    
	/*
     * This should return the call to actions of a given action. This is to help provide
     * dynamic primary and secondary call to actions based on the action record. 
     */
    getActions: function(actionRecord) {
        //No Op - Should be overriden by an extension
    },

    /*
     * This should be called by the module that implements an action type when an 
     * action in progress is dismissed by user.
     */
    dismissAction: function(currentRecord, actionRecord, actionAtrributes) {
        //No Op - Should be overriden by an extension
    },
	
    /*
     * This should be called by the module that implements an action type when an 
     * action is skipped by user. For ex whenever a guidance is skipped 
     * Guidance code should be calling this to function to mark the action skipped.
     */
    skipped: function(currentRecord, actionRecord, actionDetailSysId, actionInitialAttributes) {
        var nbaService;
        if (!gs.nil(actionDetailSysId)) {
            nbaService = new sn_nb_action.NextBestActionService();
            nbaService.actionSkipped('', '', actionDetailSysId);
        } else if (currentRecord && currentRecord.isValidRecord() &&
            actionRecord && actionRecord.isValidRecord()) {
            nbaService = new sn_nb_action.NextBestActionService();
            nbaService.actionSkipped(currentRecord, actionRecord.getUniqueValue());
        }
    },
    
	/*
     * This should be called by the module that implements an action type when an 
     * action is completed by user. For ex whenever a guidance completes Guidance 
     * code should be calling this to function to mark the action complete.
     */
    completed: function(currentRecord, actionRecord, actionDetailSysId, actionDetails, actionInitialAttributes) {
        var nbaService;
        if (!gs.nil(actionDetailSysId)) {
            nbaService = new sn_nb_action.NextBestActionService();
            nbaService.actionCompleted('', '', actionDetailSysId, actionDetails);
        } else if (currentRecord && currentRecord.isValidRecord() &&
            actionRecord && actionRecord.isValidRecord()) {
            nbaService = new sn_nb_action.NextBestActionService();
            nbaService.actionCompleted(currentRecord, actionRecord.getUniqueValue(), '', actionDetails);
        }
    },
    
	/*
     * This should be called by the module that implements an action type when an 
     * action is turned to in_progress by user. For ex whenever a guidance moves to in progress, after
     * Guidance action is taken, Guidance code should be calling this function to mark the action as in_progress.
     * This need not be called, if a recommendation needs to move to in_progress as soon as CTA on preview
     * of recommendation is clicked as that scenario is already handled by default.
     */
    progressed: function(actionDetailSysId) {
        var nbaService = new sn_nb_action.NextBestActionService();
        nbaService.actionProgressed(actionDetailSysId);
    },
	
    /* OOB implementation for finding duplicate action detail record in an array of action detail records.
     * This can be overwritten by action handlers
     */
    getDuplicate: function(actionDetailObjArr, newActionDetailObj) {
        for (var i = 0; i < actionDetailObjArr.length; i++) {
            var actionDetailObj = actionDetailObjArr[i];
            if (actionDetailObj.hasEqualInputs(newActionDetailObj))
                return actionDetailObj;
        }
    },
	
    /*
     * Returns true if the action is allowed for table.
     * This function should be overridden by extension to implement the validation
     */
    isActionAllowed: function(tableName, actionRecord) {
        //No Op - Should be overriden by an extension
        return true;
    },

    /*
	* Return custom preview experience
	*/
    getPreviewExperience: function(tableName, actionRecord){
        return '';
    },

    erroredOut: function(currentRecord, actionRecord, actionDetailSysId, actionInitialAttributes) {
      //No Op - Should be overriden by an extension
    },
    getErrorMessage: function(actionDetRecord) {
        //No Op - Should be overriden by an extension
    },
    type: 'ActionTypeHandlerBase'
};
