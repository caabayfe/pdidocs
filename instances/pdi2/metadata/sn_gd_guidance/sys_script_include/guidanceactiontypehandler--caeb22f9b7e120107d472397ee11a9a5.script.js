var GuidanceActionTypeHandler = Class.create();
GuidanceActionTypeHandler.prototype = Object.extendsObject(sn_nb_action.ActionTypeHandlerBase, {
    initialize: function() {
        this.guidanceConstants = new sn_gd_guidance.GuidanceConstants();
    },
    /*
     * This identifies the action type handled by this implementation.
     * Should be "sn_nb_action_type_definition.table_name"
     */
    getId: function() {
        this.guidanceConstants = new sn_gd_guidance.GuidanceConstants();
        return this.guidanceConstants.GUIDANCE_TABLE;
    },
    /*
     * This function is called by Next Best Action (NBA) framework to execute a single click action.
     * Invocation of this function indicates user started the execution of the action. 
     */
    executeAction: function(currentRecord, actionRecord, actionInputs, recommender, recommendedBy, actionMetadata) {
        var guidedDecisionsExecution = new sn_gd_guidance.GuidedDecisionsGuidanceExecution();
        var result = guidedDecisionsExecution.updateGuidanceInstanceExecution(recommender, recommendedBy, actionMetadata.id, actionInputs);
        if (typeof result === 'object' && result.guidanceDetails.state == 'in_error') {
            actionMetadata['guidanceDetails'] = result.guidanceDetails;
            return actionMetadata;
        }
        return result == 1 ? actionMetadata : false;

    },
    /*
     * This function is called by Next Best Action (NBA) framework to initiate an action.
     * Invocation of this function indicates user started using the action. JSON Object
     * returned by this method is persisted and passed as an attribute to the action type
     * renderer and in all the future interactions.
     */
    initializeAction: function(currentRecord, actionRecord, actionInputs, recommender, recommendedBy) {
        //Start guidance execution and returns details
        var executionId = new sn_gd_guidance.GuidedDecisionsGuidanceModel().createGuidanceHistoryRecord(recommendedBy, recommender, actionRecord.getUniqueValue(), actionInputs);
        var actionObj = {};
        actionObj.actionAttr = {
            recommender: recommender,
            recommendedBy: recommendedBy,
            type: 'guidedDecisionGuidance'
        };
        //prevent state change for Guidance Recommmendation when clicked.
        actionObj.actionState = sn_nb_action.Constants.STATE_NEW;
        return actionObj;
    },
    /*
     * This should return title of a given action. This is to help provide
     * dynamic title based on the current and action record. Same action
     * for different current records may return different titles.
     */
    getTitle: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        this.guidanceConstants = new sn_gd_guidance.GuidanceConstants();
        var title = actionRecord.getDisplayValue(this.guidanceConstants.COL_PREVIEW_TITLE);
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        var actionInputsObject = guidanceUtil.createGuidanceInputObject(actionInputs, actionInputLabels);
        var previewTitle = guidanceModel.getParsedMessageFromGuidanceInputs(title, actionInputsObject);
        if (!previewTitle) {
            previewTitle = actionRecord.getDisplayValue(this.guidanceConstants.COL_TITLE);
        }
        return previewTitle;
    },
    /*
     * This should return description of a given action. This is to help provide
     * dynamic descriptions based on the current and action record. Same action
     * for different current records may return different descriptions.
     */
    getDescription: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        var parameterizedGuidanceMsg = actionRecord.preview_message_html;
        if (!parameterizedGuidanceMsg) {
            return "";
        }
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        var actionInputsObject = guidanceUtil.createGuidanceInputObject(actionInputs, actionInputLabels);
        var previewMessage = guidanceModel.getParsedMessage(parameterizedGuidanceMsg, actionInputsObject);
        return previewMessage;
    },

    /*
     * This should return the additional fields specific to a given action type.
     */
    getCustomAttributes: function(currentRecord, actionRecord, actionInputs, actionInputLabels) {
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        var actionInputsObject = guidanceUtil.createGuidanceInputObject(actionInputs, actionInputLabels);
        var attributes = {
            previewFields: this._getPreviewFields(currentRecord, actionRecord, actionInputsObject)
        };

        return attributes;
    },

    /*
     * This should return the attributes of a guidance.
     */
    getActionAttributes: function(actionRecord, attributes) {
        var attrVal = JSON.parse(attributes);
        var recommender = attrVal.recommender;
        var recommendedBy = attrVal.recommendedBy;
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        var actionAttr = guidanceModel.getGuidanceDetails(recommender, recommendedBy);
        return actionAttr;
    },

    /* This should return preview fields Configured for a given action. This is to help provide 
     * dynamic previewFields based on the action record and actionInputs. It fetches 
     * values for fields configured in preview_fields  using actionInputs and returns 
     * the JSON which is used in UI to display field value pairs.
     */

    _getPreviewFields: function(currentRecord, actionRecord, actionInputsObject) {
        var fieldPairsArr = [];
        var fields = !gs.nil(actionRecord.preview_fields) ? actionRecord.preview_fields.split(',') : [];
        for (var i = 0; i < fields.length; i++) {
            var fieldPairObj = this._getFieldPair(fields[i], actionInputsObject);
            fieldPairsArr.push(fieldPairObj);
        }
        return fieldPairsArr;
    },
    _getFieldPair: function(path, actionInputsObject) {
        var fields = path.split('.') || [];
        var fieldObj = {},
            fieldProps;
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        fieldProps = guidanceModel.getFieldProps(path, actionInputsObject);
        fieldObj['label'] = fieldProps.labelValue;
        fieldObj['name'] = path;
        if (fieldProps.fieldType === 'reference' && fieldProps.displayValue != "") {
            fieldObj['value'] = {
                "type": "text-link",
                "label": fieldProps.displayValue,
                "href": "javascript:void(0)",
                "underlined": "true",
                "opensWindow": "false",
                "configAria": {
                    "link": {
                        "aria-label": fieldProps.labelValue + ' ' + fieldProps.displayValue,
                    }
                },
                "append-to-payload": fieldProps.refProps
            };
        } else {
            fieldObj['value'] = {
                'type': fieldProps.fieldType != 'html' ? 'string' : fieldProps.fieldType,
                'value': fieldProps.displayValue,
                'internal_value': fieldProps.internalValue
            };
        }
        return fieldObj;
    },

    /*
     * This should return if the recommended action should be hidden or not from the user
     * based on the states and checkbox value.
     */
    hideRecommendation: function(stateAttributesList, actionRecord) {
        var showGuidance = actionRecord.action_available_to_multiple_users;
        var stateCheck = stateAttributesList.some(function(e) {
            var guidanceConstants = new sn_gd_guidance.GuidanceConstants();
            return e.state == guidanceConstants.STATE_IN_PROGRESS || e.state == guidanceConstants.STATE_COMPLETED || e.state == guidanceConstants.STATE_IN_ERROR || e.state == guidanceConstants.STATE_ERROR_SKIPPED;
        });
        if (!showGuidance && stateCheck)
            return true;
        else
            return false;
    },

    /*
     * This should return the call to actions of a given action. This is to help provide
     * dynamic primary and secondary call to actions based on the action record. 
     */
    getActions: function(actionRecord) {
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        return guidanceModel.getCallToActions(actionRecord);
    },

    /*
     * Dismisses a guidance which is in progress state
     */
    dismissAction: function(currentRecord, actionRecord, actionAtrributes) {
        var attrVal = JSON.parse(actionAtrributes);
        var recommender = attrVal.recommender;
        var recommendedBy = attrVal.recommendedBy;
        var guidedDecisionsExecution = new sn_gd_guidance.GuidedDecisionsGuidanceExecution();
        guidedDecisionsExecution.skipGuidanceExecution(recommendedBy, recommender);
    },
    /*
     * Returns true if the action is allowed for table
     */
    isActionAllowed: function(tableName, actionRecord) {
        if (!actionRecord.isValidRecord())
            return false;
        return true;
    },
    /*
     * Returns Error Message Associated with Guidance action
     */
    getErrorMessage: function(actionAtrributes) {
        var attrVal = JSON.parse(actionAtrributes);
        var recommender = attrVal.recommender;
        var recommendedBy = attrVal.recommendedBy;
        if (!gs.nil(recommender) && !gs.nil(recommendedBy)) {
            var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
            return guidanceModel.getGuidanceErrorMessage(recommender, recommendedBy);
        }
        return "";
    },
    erroredOut: function(currentRecord, actionRecord, actionDetailSysId) {
        if (!gs.nil(actionDetailSysId)) {
            var nbaService = new sn_nb_action.NextBestActionService();
            nbaService.actionErrored(currentRecord, actionRecord, actionDetailSysId);
        }
    },

    /*
     * Return custom preview experience
     */
    getPreviewExperience: function(tableName, actionRecord) {
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        return guidanceModel.getPreviewExperience(actionRecord);
    },

    /*
     * This should check whether the recommendation is allowed to hide or not
     * params consists of attributes:which is an object storing 'state' and parent hash id of recommendation
     * and section: to identify if card is in 'current' or 'history' section
     */
    isRAHideEligible: function(attributes, section) {
        if (section == 'current' && attributes.state == sn_nb_action.Constants.STATE_NEW && attributes.parentId)
            return true;
        else
            return false;
    },

    updateActionInputs: function(actionInputs, recommender, recommendedBy) {
        var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
        guidanceModel.updateGuidanceHistoryRecord(recommendedBy, recommender, actionInputs);
    },

    type: 'GuidanceActionTypeHandler'
});
