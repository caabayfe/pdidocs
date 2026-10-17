var ActionServiceImpl = Class.create();
ActionServiceImpl.prototype = {
    initialize: function() {
        this.nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();
        this._actionInputPillParser = new sn_nb_action.NBAActionInputPillParser();
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
    },
    getActionsForUnsavedChanges: function(contextRecord, currentRecord, recommendationType, currentActions) {
        var actionDetails = [];
        var actionDetailsInNewState = [];
        var actionDetailsInCompletedState = [];
        var actionDetailsInSkippedState = [];
        var result = {};
        result.contextId = contextRecord.getUniqueValue();
        result.contextState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
        for (var key in currentActions) {
            if (currentActions.hasOwnProperty(key)) {
                for (var i = 0; i < currentActions[key].length; i++) {
                    var currentDetail = currentActions[key][i];
                    var detailObject = this._getActionDetailObject(currentRecord, currentDetail);
                    this._pushToDetailOrders(detailObject, actionDetails, actionDetailsInNewState, actionDetailsInCompletedState, actionDetailsInSkippedState);
                }
            }
        }
        actionDetailsInNewState.sort(this._sortByActionScore);
        actionDetails = this._appendActionDetails(actionDetails, actionDetailsInNewState);
        actionDetails = this._appendActionDetails(actionDetails, actionDetailsInCompletedState);
        actionDetails = this._appendActionDetails(actionDetails, actionDetailsInSkippedState);
        result.actionDetails = actionDetails;
        return result;
    },
    getActions: function(contextRecord, currentRecord, recommendationType, actionDetailsList) {
        var states = [
            sn_nb_action.Constants.STATE_NEW,
            sn_nb_action.Constants.STATE_IN_PROGRESS,
            sn_nb_action.Constants.STATE_COMPLETED,
            sn_nb_action.Constants.STATE_SKIPPED,
            sn_nb_action.Constants.STATE_IN_ERROR,
            sn_nb_action.Constants.STATE_ERROR_SKIPPED
        ];
        var actionDetailRecords = this.nextBestActionDAO.getAllActionDetails(contextRecord, states, recommendationType);
        var result = {};
        result.contextId = contextRecord.getUniqueValue();
        result.contextState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
        var actionDetails = [];
        var actionDetailsInNewState = [];
        var actionDetailsInCompletedState = [];
        var actionDetailsInSkippedState = [];
        var actionTypeObj = {};
        var actionPropObj = {};
        var newActionDetails = [];
        var hashIdToActionInputMap = {};
        if (actionDetailsList) {
            newActionDetails = actionDetailsList.newActionDetails;
            if (newActionDetails) {
                for (var i = 0; i < newActionDetails.length; i++) {
                    var hashId = newActionDetails[i].getParentActionId();
                    var actionInput = newActionDetails[i].getActionInputs();
                    var actionInputLabels = newActionDetails[i].getActionInputLabels();
                    hashIdToActionInputMap[hashId] = {
                        actionInput: actionInput,
                        actionInputLabels: actionInputLabels
                    };
                }
            }
        }
        if (actionDetailRecords) {
            while (actionDetailRecords.next()) {

                if (!gs.nil(actionDetailRecords[sn_nb_action.Constants.COL_RULE]))
                    this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecords);


                var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecords);
                var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecords, actionDetailOrders, '', hashIdToActionInputMap);
                if (!this._hasActiveActionDetailOrder(actionDetObj) && !this._persistActionDetail(actionDetObj))
                    continue;
                else if (this._isRAHideEligible(actionDetailRecords, actionDetObj, 'current')) {
                    var hideRA = this.hideRecommendation(actionDetailRecords);
                    if (hideRA)
                        continue;

                }
                try {
                    var actionDetail = this._fetchActionDetailProps(currentRecord, actionDetailRecords, actionDetObj, actionTypeObj, actionPropObj);
                    this._pushToDetailOrders(actionDetail, actionDetails, actionDetailsInNewState, actionDetailsInCompletedState, actionDetailsInSkippedState);
                } catch (ex) {
                    this._log.error("Cannot fetch details for action detail " + actionDetailRecords.getUniqueValue());
                }
            }
            actionDetailsInNewState.sort(this._sortByActionScore);
            actionDetails = this._appendActionDetails(actionDetails, actionDetailsInNewState);
            actionDetails = this._appendActionDetails(actionDetails, actionDetailsInCompletedState);
            actionDetails = this._appendActionDetails(actionDetails, actionDetailsInSkippedState);
        }
        result.actionDetails = actionDetails;
        return result;
    },
    /*
    Returns JSON object containing actionDetail records for 'completed' or 'skipped' actions type.
    */

    getCompletedAndSkippedActions: function(contextRecord, currentRecord, recommendationType) {
        var states = [sn_nb_action.Constants.STATE_COMPLETED, sn_nb_action.Constants.STATE_SKIPPED, sn_nb_action.Constants.STATE_IN_ERROR, sn_nb_action.Constants.STATE_ERROR_SKIPPED];
        var actionDetailRecords = this.nextBestActionDAO.getAllActionDetails(contextRecord, states, recommendationType);
        var result = {};
        result.contextId = contextRecord.getUniqueValue();
        result.contextState = contextRecord.getValue(sn_nb_action.Constants.COL_STATE);
        var actionDetails = [];

        var actionDetailsInCompletedState = [];
        var actionDetailsInSkippedState = [];
        var actionTypeObj = {};
        var actionPropObj = {};

        if (actionDetailRecords) {
            while (actionDetailRecords.next()) {


                var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecords);
                var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecords, actionDetailOrders);
                if (this._isRAHideEligible(actionDetailRecords, actionDetObj, 'history')) {
                    var hideRA = this.hideRecommendation(actionDetailRecords);
                    if (hideRA)
                        continue;
                }
                try {
                    if (!this._excludeFromHistory(actionDetObj)) {
                        var actionDetail = this._fetchActionDetailProps(currentRecord, actionDetailRecords, actionDetObj, actionTypeObj, actionPropObj);
                        this._pushToDetailOrders(actionDetail, actionDetails, [], actionDetailsInCompletedState, actionDetailsInSkippedState);
                    }
                } catch (ex) {
                    this._log.error("Cannot fetch details for action detail " + actionDetailRecords.getUniqueValue());
                }


            };
            actionDetails = this._appendActionDetails(actionDetails, actionDetailsInCompletedState);
            actionDetails = this._appendActionDetails(actionDetails, actionDetailsInSkippedState);
        }
        result.actionDetails = actionDetails;
        return result;
    },

    fetchSearchActions: function(outputs, currentRecord, ruleContext, actionTypes) {

        var searchActionArr = [];
        var searchActionMapRecord;
        var contextInputsObject = this.nextBestActionDAO.getContextInputsObject(currentRecord, ruleContext.getUniqueValue());
        for (var idx = 0; idx < outputs.length; idx++) {
            var searchOutputRecord = outputs[idx].search_result;
            var table = searchOutputRecord ? searchOutputRecord.getTableName() : "";
            var geniusId = outputs[idx].modelId;
            if (geniusId) {

                searchActionMapRecord = this.nextBestActionDAO.getGeniusActionMapRecord(geniusId, ruleContext);
            } else
                searchActionMapRecord = this.nextBestActionDAO.getSearchActionMapRecord(table, ruleContext);



            if (searchActionMapRecord) {

                var action = searchActionMapRecord[sn_nb_action.Constants.COL_ACTION].getRefRecord();
                var hint = geniusId ? searchActionMapRecord[sn_nb_action.Constants.COL_GENIUS_RESULT_CONFIG].getDisplayValue() : searchOutputRecord.getClassDisplayValue();
                var actionInputGlideVar = searchActionMapRecord[Constants.COL_ACTION_INPUT];
                outputs[idx].contextInputs = contextInputsObject;
                var inputObj = this._actionInputPillParser.parseActionInputsPill(actionInputGlideVar, outputs[idx], currentRecord);
                var searchActionObj = sn_nb_action.RecommendedAction.createFromSearchRecord(action, inputObj.actionInputValues, hint, inputObj.actionInputLabels, geniusId, outputs[idx]);
                searchActionArr.push(searchActionObj);
            }
        }
        var searchActions = {};
        searchActions.searchActionDetails = [];
        if (searchActionArr && Array.isArray(searchActionArr) && searchActionArr.length > 0)
            searchActions = this._getSearchActions(currentRecord, searchActionArr, actionTypes, ruleContext);

        return searchActions;


    },

    _getSearchActions: function(currentRecord, searchActions, actionTypes, ruleContext) {
        var result = {};
        var searchActionDetails = [];
        var states = [sn_nb_action.Constants.STATE_COMPLETED, sn_nb_action.Constants.STATE_SKIPPED, sn_nb_action.Constants.STATE_IN_ERROR, sn_nb_action.Constants.STATE_ERROR_SKIPPED];
        var contextRecord = this.nextBestActionDAO.getContext(currentRecord, ruleContext.getUniqueValue());
        var existing_hash_values = [];
        var existing_action_detail_records = this.nextBestActionDAO.getAllActionDetails(contextRecord, states);
        if (existing_action_detail_records) {
            while (existing_action_detail_records.next()) {
                existing_hash_values.push(existing_action_detail_records.getValue(sn_nb_action.Constants.COL_PARENT_RA_ID));
            }
        }
        for (var i = 0; i < searchActions.length; i++) {
            var actionRecord = searchActions[i].getAction();
            if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord) || sn_nb_action.NextBestActionUtil.checkIsExistingSearchResult(currentRecord.getUniqueValue(), searchActions[i].getAction().getUniqueValue(), searchActions[i].getActionInputs(), existing_hash_values))
                continue;


            var actionTable = actionRecord.getTableName();
            var actionTypeDetail = actionTypes[actionTable];
            var searchDetailObject = this._searchActionObject(currentRecord, actionRecord, searchActions[i], actionTypeDetail);
            searchActionDetails.push(searchDetailObject);
        }

        result.searchActionDetails = searchActionDetails;
        return result;
    },

    _getInputLabels: function(inputGlideVar) {
        var inputObj = new Object();
        for (var attribute in inputGlideVar) {
            if (attribute == "sys_meta" || attribute == "sys_id")
                continue;

            inputObj[attribute] = inputGlideVar[attribute].getLabel();
        }
        return inputObj;
    },
    _pushToDetailOrders: function(detailObject, actionDetails, actionDetailsInNewState, actionDetailsInCompletedState, actionDetailsInSkippedState) {
        if (detailObject) {
            if (detailObject.actionState.value == sn_nb_action.Constants.STATE_IN_PROGRESS)
                actionDetails.push(detailObject);
            else if (detailObject.actionState.value == sn_nb_action.Constants.STATE_NEW)
                actionDetailsInNewState.push(detailObject);
            else if (detailObject.actionState.value == sn_nb_action.Constants.STATE_COMPLETED)
                actionDetailsInCompletedState.push(detailObject);
            else
                actionDetailsInSkippedState.push(detailObject);

        }
    },
    _getActionTypeRecord: function(currentDetail) {
        var actionTypeRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_TYPE_DEFINITION);
        actionTypeRecord.get(currentDetail.actionTypeSysId);
        return actionTypeRecord;
    },
    _getActionRecord: function(currentDetail) {
        var actionRecord = new GlideRecord(currentDetail.actionTypeTable);
        actionRecord.get(currentDetail.actionSysId);
        return actionRecord;
    },
    executeAction: function(contextRecord, currentRecord, actionDetailSysId, actionMetadata, actionInputs) {
        var actionDetailRecord;
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);


        // if actionDetailSysId still contains actionSysId value try fetching actionDetailRecord again
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionDetailSysId);

        var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
        var actionHandler = this._getActionHandler(actionDetailRecord);
        var actionObj = actionHandler.executeAction(currentRecord, actionRecord, actionInputs, sn_nb_action.Constants.TBL_ACTION_DETAIL, actionDetailRecord.getUniqueValue(), actionMetadata);
        actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);
        actionObj[sn_nb_action.Constants.COL_STATE] = actionDetailRecord[sn_nb_action.Constants.COL_STATE];
        return actionObj;
    },
    useAction: function(contextRecord, currentRecord, actionDetailSysId, actionInputs) {
        var actionDetailRecord;
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);


        // if actionDetailSysId still contains actionSysId value try fetching actionDetailRecord again
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionDetailSysId);


        if (this.hideRecommendation(actionDetailRecord)) {
            return this._getHideActionResponse();
        }
        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
                this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);

            //create new actionInputs object with updated values if actionInputs present
            var updatedActionInputs = actionDetailRecord[sn_nb_action.Constants.COL_ACTION_INPUTS];
            if (actionInputs && !NextBestActionUtil.isEmptyObject(actionInputs)) {
                updatedActionInputs = {};
                var actionInputsRecord = actionDetailRecord[sn_nb_action.Constants.COL_ACTION_INPUTS];
                Object.keys(actionInputsRecord).forEach(function(key) {
                    if (key == "sys_meta" || key == "sys_id")
                        return;
                    updatedActionInputs[key] = actionInputsRecord[key];
                    if (actionInputs.hasOwnProperty(key)) {
                        updatedActionInputs[key] = actionInputs[key];
                    }
                });
            }

            var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecord);
            var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecord, actionDetailOrders);

            var currentState = actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE);
            if (actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE) != sn_nb_action.Constants.STATE_NEW && actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE) != sn_nb_action.Constants.STATE_IN_PROGRESS) {
                this._log.error("Cannot use action detail " + actionDetailRecord.getUniqueValue() + ", state : " + currentState);
                return false;
            }

            if (actionDetailOrders && !this._hasActiveActionDetailOrder(actionDetObj)) {
                this._log.error("Action detail " + actionDetailRecord.getUniqueValue() + ", cannot be started by user: " + gs.getUserDisplayName());
                return false;
            }

            var actionHandler = this._getActionHandler(actionDetailRecord);
            if (actionHandler && typeof actionHandler.initializeAction === "function") {
                var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
                if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                    try {
                        if (!sn_nb_action.NextBestActionUtil.isValidString(actionDetailRecord.attribute)) {
                            var actionObj = actionHandler.initializeAction(currentRecord, actionRecord, updatedActionInputs, sn_nb_action.Constants.TBL_ACTION_DETAIL, actionDetailRecord.getUniqueValue());
                            var actionState = sn_nb_action.Constants.STATE_IN_PROGRESS;
                            if (actionObj.actionState && actionObj.actionState != null && actionObj.actionState != "")
                                actionState = actionObj.actionState;

                            if (actionObj.actionAttr && actionObj.actionAttr != null) {
                                this.nextBestActionDAO.setActionAttribute(actionDetailRecord, actionObj.actionAttr);
                                actionDetObj.setAttribute(JSON.stringify(actionObj.actionAttr));
                            } else
                                actionObj.actionAttr = "";

                            this.nextBestActionDAO.setActionState(actionDetailRecord, actionState);
                            actionDetObj.setState(actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE));
                            actionDetObj.setStateDisplayValue(actionDetailRecord.getDisplayValue(sn_nb_action.Constants.COL_STATE));
                            this._log.debug("Action " + actionRecord.getUniqueValue() + " initialized.");
                        } else {
                            //Update the action inputs in the execution records for RA update usecase
                            if (actionInputs && !NextBestActionUtil.isEmptyObject(actionInputs)) {
                                actionHandler.updateActionInputs(updatedActionInputs, sn_nb_action.Constants.TBL_ACTION_DETAIL, actionDetailRecord.getUniqueValue());
                            }
                        }
                        return this._fetchActionDetailProps(currentRecord, actionDetailRecord, actionDetObj, {}, {});
                    } catch (ex) {
                        this._log.error("Failed to initialize action " + actionRecord.getUniqueValue() + "; " + ex);
                    }
                } else
                    this._log.error("Could not find the action recommended in detail " + actionDetailRecord.getUniqueValue());

            } else
                this._log.error("Could not find the handler for action recommended in detail " + actionDetailRecord.getUniqueValue());

        } else
            this._log.warn("Could not find action detail for action " + actionDetailSysId);

        return false;

    },

    dismissAction: function(contextRecord, currentRecord, actionDetailSysId) {
        var actionDetailRecord;
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);


        // if actionDetailSysId still contains actionSysId value try fetching actionDetailRecord again
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionDetailSysId);

        if (this.hideRecommendation(actionDetailRecord)) {
            return this._getHideActionResponse();
        }
        var currentState = actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE);
        if (currentState == sn_nb_action.Constants.STATE_NEW) {
            this._changeState(actionDetailRecord, sn_nb_action.Constants.STATE_SKIPPED);
            return;
        }
        if (currentState == sn_nb_action.Constants.STATE_IN_PROGRESS || currentState == sn_nb_action.Constants.STATE_IN_ERROR) {
            var actionHandler = this._getActionHandler(actionDetailRecord);
            if (actionHandler) {
                var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
                if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                    try {
                        if (typeof actionHandler.dismissAction === "function") {
                            actionHandler.dismissAction(currentRecord, actionRecord, actionDetailRecord.getValue(sn_nb_action.Constants.COL_ATTRIBUTE));
                        }
                    } catch (ex) {
                        this._log.error("Failed to dismiss the recommended actions " + actionRecord.getUniqueValue());
                    }
                }
            } else
                this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

        }
        return;
    },

    getActionDetail: function(contextRecord, currentRecord, actionDetailSysId) {
        var actionDetailRecord;
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);


        // if actionDetailSysId still contains actionSysId value try fetching actionDetailRecord again
        if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionDetailSysId);


        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
                this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);


            var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecord);
            var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecord, actionDetailOrders);

            var currentState = actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE);
            if (currentState == sn_nb_action.Constants.STATE_NEW && !this._hasActiveActionDetailOrder(actionDetObj)) {
                this._log.error("Action detail " + actionDetailRecord.getUniqueValue() + ", cannot be fetched by user: " + gs.getUserDisplayName());
                return false;
            }
            return this._fetchActionDetailProps(currentRecord, actionDetailRecord, actionDetObj, {}, {});
        } else
            this._log.warn("Could not find action detail for the sys id " + actionDetailSysId);

        return false;
    },
    _getActionScore: function(actionDetObj) {
        var actionScore = 0;
        var state = actionDetObj.getState();
        var actionOrders = [];
        var ruleActionOrderObj = actionDetObj.getRules();
        if (!gs.nil(ruleActionOrderObj)) {
            for (var rule in ruleActionOrderObj)
                actionOrders.push(ruleActionOrderObj[rule]);
            actionOrders.sort(this._compareByInterOrder);
            if (state == sn_nb_action.Constants.STATE_NEW)
                actionScore = new sn_nb_action.NextBestActionRanking().getActionScore(actionOrders);

            if (gs.nil(actionOrders))
                return false;

        }
        return actionScore;
    },
    _getTag: function(actionTypeRecord) {
        var tag = '';
        var rendererRecord = actionTypeRecord[sn_nb_action.Constants.COL_RENDERER].getRefRecord();
        if (sn_nb_action.NextBestActionUtil.isValidRecord(rendererRecord))
            tag = rendererRecord.getValue(sn_nb_action.Constants.COL_TAG) || "";

        return tag;
    },
    _getIconName: function(actionTypeRecord) {
        var iconName = '';
        var designIconRecord = actionTypeRecord[sn_nb_action.Constants.COL_ICON].getRefRecord();
        if (sn_nb_action.NextBestActionUtil.isValidRecord(designIconRecord))
            iconName = designIconRecord.getValue(sn_nb_action.Constants.COL_NAME) || "";

        return iconName;
    },
    _getHint: function(rules) {
        var rAOrderArray = sn_nb_action.NextBestActionUtil.getObjectValues(rules);
        rAOrderArray.sort(this._compareByInterOrder);
        if (rAOrderArray.length > 0)
            return rAOrderArray[0].getHint();

        return false;
    },
    _getAttribute: function(actionDetObj) {
        var attribute = actionDetObj.getAttribute();
        var attrVal;
        if (!gs.nil(attribute))
            attrVal = JSON.parse(attribute);

        if (!sn_nb_action.NextBestActionUtil.isValidString(attrVal))
            attrVal = "";

        return attrVal;

    },

    _searchActionObject: function(currentRecord, actionRecord, searchDetail, actionTypeDetail) {
        var actionTypeRecord = this._getActionTypeRecordForSearch(actionTypeDetail);
        var searchDetObj = sn_nb_action.ActionDetail.createFromSearchRecord(actionTypeDetail, actionRecord.getUniqueValue(), searchDetail.actionInputs);
        this._setTitleAndDescription(actionTypeRecord, actionRecord, currentRecord, searchDetail, searchDetObj);
        this._setCallToActions(actionTypeRecord, actionRecord, currentRecord, searchDetail, searchDetObj);
        this._setCustomAttributes(actionTypeRecord, actionRecord, currentRecord, searchDetail, searchDetObj);
        this._setCustomPreviewExperience(actionTypeRecord, actionRecord, currentRecord, searchDetObj);
        var actionType = actionTypeRecord.getDisplayValue(sn_nb_action.Constants.COL_TITLE);
        var tag = this._getTag(actionTypeRecord);
        var iconName = "magnifying-glass-sparkle-outline";
        var hint = searchDetail.getHint();
        var actionInput = this._getActionInputIds(searchDetObj.getActionInputs());
        var searchResultTitle = searchDetail.searchResultTitle;
        if (searchResultTitle) {
            searchResultTitle = searchResultTitle.replace(/<\/?highlight>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
        }

        var searchActionDetail = {
            actionId: searchDetObj.getAction(),
            useCase: "search",
            isGenius: searchDetail.isGenius,
            actionType: actionType,
            actionTypeSysId: actionTypeRecord.getUniqueValue(),
            actionState: {
                label: "New",
                value: "new"
            },
            actionInputs: actionInput,
            title: searchDetObj.getTitle(),
            description: searchDetObj.getDescription(),
            recommendationHint: hint,
            callToActions: searchDetObj.getCallToActions(),
            renderer: tag,
            iconName: iconName,
            customAttributes: searchDetObj.getCustomAttribute(),
            customExperience: searchDetObj.getPreviewExperience(),
            searchResultNumber: searchDetail.searchResultNumber,
            searchResultTable: searchDetail.searchResultTable,
            searchResultId: searchDetail.searchResultId,
            searchResultTitle: searchResultTitle,
            searchResultURL: searchDetail.searchResultURL,
            searchResultDocIndex: searchDetail.searchResultDocIndex,
            searchResultAISDocId: searchDetail.searchResultAISDocId
        };
        return searchActionDetail;

    },
    _getActionTypeRecordForSearch: function(actionTypeDetail) {
        var actionTypeRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_TYPE_DEFINITION);
        actionTypeRecord.get(actionTypeDetail[sn_nb_action.Constants.COL_SYS_ID]);
        return actionTypeRecord;
    },

    _getActionDetailObject: function(currentRecord, currentDetail) {
        var actionTypeRecord = this._getActionTypeRecord(currentDetail);
        var actionRecord = this._getActionRecord(currentDetail);
        var actionDetObj = sn_nb_action.ActionDetail.createFromUnsavedRecord(currentDetail, currentDetail.actionTypeTable, currentDetail.actionTypeSysId, actionRecord.getUniqueValue(), currentDetail.actionInputs);
        this._setTitleAndDescription(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetObj);
        this._setCallToActions(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetObj);
        this._setCustomAttributes(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetObj);
        var actionType = actionTypeRecord.getDisplayValue(sn_nb_action.Constants.COL_TITLE);
        var tag = this._getTag(actionTypeRecord);
        var iconName = this._getIconName(actionTypeRecord);
        var hint = this._getHint(currentDetail.ruleSysIds);
        var actionScore = this._getActionScore(actionDetObj);
        var attrVal = this._getAttribute(actionDetObj);
        var actionDetail = {
            actionId: actionDetObj.getAction(),
            actionDetailId: actionDetObj.getId(),
            actionType: actionType,
            actionState: {
                label: actionDetObj.getStateDisplayValue(),
                value: actionDetObj.getState()
            },
            title: actionDetObj.getTitle(),
            description: actionDetObj.getDescription(),
            recommendationHint: hint,
            callToActions: actionDetObj.getCallToActions(),
            renderer: tag,
            iconName: iconName,
            createdOn: actionDetObj.getCreatedOn(),
            updatedOn: actionDetObj.getUpdatedOn(),
            attributes: attrVal,
            actionScore: actionScore,
            customAttributes: actionDetObj.getCustomAttribute()
        };
        if (actionDetObj.getState() == sn_nb_action.Constants.STATE_IN_ERROR || actionDetObj.getState() == sn_nb_action.Constants.STATE_ERROR_SKIPPED) {
            actionDetail['errorMessage'] = actionDetObj.getErrorMessage();
        }
        return actionDetail;
    },
    _fetchActionDetailProps: function(currentRecord, actionDetailRecord, actionDetObj, actionTypeObj, actionPropObj) {
        var action = actionDetailRecord.getValue(sn_nb_action.Constants.COL_RECOMMENDED);

        this._addTitleAndDescription(currentRecord, actionDetailRecord, actionDetObj);
        this._addCustomAttributes(currentRecord, actionDetailRecord, actionDetObj);

        if (actionPropObj && actionPropObj.hasOwnProperty(action)) {
            actionDetObj.setCallToActions(actionPropObj[action].callToActions);
            actionDetObj.setPreviewExperience(actionPropObj[action].customExperience);
        } else {
            this._addCallToActions(currentRecord, actionDetailRecord, actionDetObj);
            this._addCustomPreviewExpereince(currentRecord, actionDetailRecord, actionDetObj);
            actionPropObj[action] = {
                callToActions: actionDetObj.getCallToActions(),
                customExperience: actionDetObj.getPreviewExperience()
            };
        }

        if (actionDetailRecord.state == sn_nb_action.Constants.STATE_IN_ERROR || actionDetailRecord.state == sn_nb_action.Constants.STATE_ERROR_SKIPPED) {
            this._addErrorMessage(actionDetailRecord, actionDetObj);
        }
        var attrVal = JSON.parse(actionDetObj.getAttribute());
        if (!sn_nb_action.NextBestActionUtil.isValidString(attrVal))
            attrVal = "";

        var actionType = "";
        var tag = "";
        var iconName = "";
        // to handle upgrade scenario for completed guidances
        var currentState = actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE);
        if (currentState == sn_nb_action.Constants.STATE_COMPLETED && attrVal.recommender && !attrVal.hasOwnProperty('actionOutputs'))
            attrVal = this._updateActionDetailAttributes(actionDetailRecord);

        var actionTypeId = actionDetailRecord.getValue(sn_nb_action.Constants.COL_ACTION_TYPE);
        if (actionTypeObj && actionTypeObj.hasOwnProperty(actionTypeId)) {
            actionType = actionTypeObj[actionTypeId].actionType;
            tag = actionTypeObj[actionTypeId].tag;
            iconName = actionTypeObj[actionTypeId].iconName;
        } else {
            var actionTypeRecord = actionDetailRecord[sn_nb_action.Constants.COL_ACTION_TYPE].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionTypeRecord)) {
                actionType = actionTypeRecord.getDisplayValue(sn_nb_action.Constants.COL_TITLE);
                var rendererRecord = actionTypeRecord[sn_nb_action.Constants.COL_RENDERER].getRefRecord();
                if (sn_nb_action.NextBestActionUtil.isValidRecord(rendererRecord))
                    tag = rendererRecord.getValue(sn_nb_action.Constants.COL_TAG) || "";
                iconName = actionTypeRecord.icon ? actionTypeRecord.getValue('icon').replaceAll("_", "-") : '';
                actionTypeObj[actionTypeId] = {
                    iconName: iconName,
                    tag: tag,
                    actionType: actionType
                };
            }
        }

        var actionScore = 0;
        var hint = "";
        if (actionDetailRecord[sn_nb_action.Constants.COL_USE_CASE] != sn_nb_action.Constants.CHOICE_USE_CASE_SEARCH) {
            var actionOrders = [];
            var ruleActionOrderObj = actionDetObj.getRules();
            if (!gs.nil(ruleActionOrderObj)) {
                for (var rule in ruleActionOrderObj) {
                    if (ruleActionOrderObj[rule].isActive())
                        actionOrders.push(ruleActionOrderObj[rule]);

                }
                actionOrders.sort(this._compareByInterOrder);
                if (actionDetailRecord.state == sn_nb_action.Constants.STATE_NEW)
                    actionScore = new sn_nb_action.NextBestActionRanking().getActionScore(actionOrders);

                hint = actionOrders.length > 0 ? actionOrders[0].getHint() : false;
            }
        }

        var actionInputs = this._getActionInputIds(actionDetObj.getActionInputs());
        var actionDetail = {
            actionId: actionDetObj.getAction(),
            actionDetailId: actionDetObj.getId(),
            actionType: actionType,
            actionState: {
                label: actionDetObj.getStateDisplayValue(),
                value: actionDetObj.getState()
            },
            title: actionDetObj.getTitle(),
            description: actionDetObj.getDescription(),
            recommendationHint: hint,
            callToActions: actionDetObj.getCallToActions(),
            renderer: tag,
            iconName: iconName,
            createdOn: actionDetObj.getCreatedOn(),
            updatedOn: actionDetObj.getUpdatedOn(),
            attributes: attrVal,
            actionScore: actionScore,
            customAttributes: actionDetObj.getCustomAttribute(),
            customExperience: actionDetObj.getPreviewExperience(),
            actionGroups: actionDetObj.getActionGroupsAsCommaSeparatedString(),
            actionInputs: actionInputs,
            useCase: actionDetObj.getUseCase()
        };
        if (actionDetObj.getState() == sn_nb_action.Constants.STATE_IN_ERROR || actionDetObj.getState() == sn_nb_action.Constants.STATE_ERROR_SKIPPED) {
            actionDetail['errorMessage'] = actionDetObj.getErrorMessage();
        }
        return actionDetail;
    },


    // Returns true if Action Detail Record has atleast one active Action Detail Order Record
    _hasActiveActionDetailOrder: function(actionDetObj) {
        var ruleActionOrderObj = actionDetObj.getRules();
        for (var rule in ruleActionOrderObj) {
            if (ruleActionOrderObj[rule].isActive())
                return true;

        }
        return false;
    },

    // updates the attributes of the action detail record
    _updateActionDetailAttributes: function(actionDetailRecord) {
        var attributes = JSON.parse(actionDetailRecord.getValue('attribute'));
        var actionDetails = this._getActionAttributes(actionDetailRecord);
        attributes['actionOutputs'] = actionDetails['actionOutputs'];
        attributes = JSON.stringify(attributes);
        actionDetailRecord.setValue('attribute', attributes);
        actionDetailRecord.update();
        return JSON.parse(attributes);
    },

    /*
     * Checks if current user on basis of roles should be allowed access the recommendation
     */
    _isAccessible: function(actionDetObj) {
        var ruleActionOrderObj = actionDetObj.getRules();
        for (var rule in ruleActionOrderObj) {
            if (gs.hasRole(ruleActionOrderObj[rule].getRoles()))
                return true;

        }
        return false;
    },

    // Returns true if a recommendation needs to persist even when rule recommending it is not satisfied anymore
    _persistActionDetail: function(actionDetObj) {
        var currentState = actionDetObj.getState();
        if (currentState == sn_nb_action.Constants.STATE_IN_PROGRESS || currentState == sn_nb_action.Constants.STATE_COMPLETED || currentState == sn_nb_action.Constants.STATE_SKIPPED || currentState == sn_nb_action.Constants.STATE_IN_ERROR || currentState == sn_nb_action.Constants.STATE_ERROR_SKIPPED)
            return true;

        return false;
    },

    _excludeFromHistory: function(actionDetObj) {
        if (actionDetObj.state == sn_nb_action.Constants.STATE_IN_ERROR && actionDetObj.useCase == sn_nb_action.Constants.CHOICE_USE_CASE_RA) {
            return true;
        }
        return false;
    },

    ignoreAction: function(contextRecord, actionSysId) {
        var actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionSysId);
        if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
            this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);


        var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecord);
        var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecord, actionDetailOrders);

        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            return this._changeState(actionDetailRecord, sn_nb_action.Constants.STATE_IGNORED);
        } else
            this._log.warn("Could not find action detail for action " + actionSysId);

        return false;
    },

    skipAction: function(contextRecord, actionSysId, actionDetailSysId, actionInitialAttributes) {
        var actionDetailRecord;
        if (gs.nil(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionSysId);
        else
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);
        if (actionDetailRecord) {
            var attributes = actionDetailRecord.getValue('attribute');
            if (actionDetailRecord.state != sn_nb_action.Constants.STATE_SKIPPED && actionInitialAttributes && actionInitialAttributes.id == sn_nb_action.Constants.TBL_DECISION_TREE && gs.nil(attributes)) {
                this.nextBestActionDAO.setActionAttribute(actionDetailRecord, actionInitialAttributes.attributes);
            }
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
                if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
                    this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);
                var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecord);
                var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecord, actionDetailOrders);
                var state = sn_nb_action.Constants.STATE_SKIPPED;
                if (actionDetailRecord.state == sn_nb_action.Constants.STATE_IN_ERROR) {
                    state = sn_nb_action.Constants.STATE_ERROR_SKIPPED;
                }
                return this._changeState(actionDetailRecord, state);
            } else
                this._log.warn("Could not find action detail for action " + actionSysId);
        } else {
            this._log.warn("Could not find action detail for action " + actionSysId);
            return false;
        }
    },
    completeAction: function(contextRecord, actionSysId, actionDetailSysId, actionDetails, actionInitialAttributes) {
        var actionDetailRecord;
        if (gs.nil(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionSysId);
        else
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);
        if (actionDetailRecord) {
            if (actionDetailRecord.state != sn_nb_action.Constants.STATE_SKIPPED && actionInitialAttributes && actionInitialAttributes.id == sn_nb_action.Constants.TBL_DECISION_TREE && gs.nil(actionDetailRecord.getValue(sn_nb_action.Constants.COL_ATTRIBUTE)))
                this.nextBestActionDAO.setActionAttribute(actionDetailRecord, actionInitialAttributes.attributes);
            var attributes = JSON.parse(actionDetailRecord.getValue('attribute'));
            if (actionDetails) {
                for (var key in actionDetails)
                    attributes[key] = actionDetails[key];
                attributes = JSON.stringify(attributes);
                actionDetailRecord.setValue('attribute', attributes);
                actionDetailRecord.update();
            }
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
                if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
                    this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);
                var actionDetailOrders = this.nextBestActionDAO.getActionDetailOrders(actionDetailRecord);
                var actionDetObj = sn_nb_action.ActionDetail.createFromRecord(actionDetailRecord, actionDetailOrders);
                return this._changeState(actionDetailRecord, sn_nb_action.Constants.STATE_COMPLETED);
            } else
                this._log.warn("Could not find action detail for action " + actionSysId);
        } else {
            this._log.warn("Could not find action detail for action " + actionSysId);
            return false;
        }
    },
    progressAction: function(actionDetailSysId) {
        var actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);
        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            if (!gs.nil(actionDetailRecord[sn_nb_action.Constants.COL_RULE]))
                this.nextBestActionDAO.updateActionDetailOnUpgrade(actionDetailRecord);

            return this._changeState(actionDetailRecord, sn_nb_action.Constants.STATE_IN_PROGRESS);
        } else
            this._log.warn("Could not find action detail for action " + actionDetailSysId + " when trying to set RA in_progress");

        return false;
    },

    _changeState: function(actionDetailRecord, state) {
        var currentState = actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE);
        if (currentState == sn_nb_action.Constants.STATE_NEW && (state != sn_nb_action.Constants.STATE_IN_PROGRESS && state != sn_nb_action.Constants.STATE_IGNORED && state != sn_nb_action.Constants.STATE_SKIPPED && state != sn_nb_action.Constants.STATE_COMPLETED && state != sn_nb_action.Constants.STATE_IN_ERROR)) {
            this._log.error("Action state is new, it cannot be changed to " + state);
            return false;
        }

        if (currentState == sn_nb_action.Constants.STATE_IN_PROGRESS && (state != sn_nb_action.Constants.STATE_SKIPPED && state != sn_nb_action.Constants.STATE_COMPLETED && state != sn_nb_action.Constants.STATE_IN_ERROR)) {
            this._log.error("Action state is in use, it cannot be changed to " + state);
            return false;
        }

        if (currentState == sn_nb_action.Constants.STATE_IGNORED || currentState == sn_nb_action.Constants.STATE_SKIPPED || currentState == sn_nb_action.Constants.STATE_COMPLETED) {
            this._log.error("Action state is " + currentState + ", it cannot be changed");
            return false;
        }
        return this.nextBestActionDAO.setActionState(actionDetailRecord, state);
    },

    hideRecommendation: function(actionDetailRecord) {
        var hash = actionDetailRecord.getValue(sn_nb_action.Constants.COL_PARENT_RA_ID);
        // for upgrade scenarios when hash is empty
        if (gs.nil(hash))
            return false;

        var stateAttributesList = this.nextBestActionDAO.getStatesAttributesListFromActionDetails(hash, actionDetailRecord);

        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.hideRecommendation === "function") {
                        var hideAction = actionHandler.hideRecommendation(stateAttributesList, actionRecord);
                        return hideAction;
                    }
                } catch (ex) {
                    this._log.error("Failed to get hideAction value of recommended action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

    },

    _isRAHideEligible: function(actionDetailRecord, actionDetailObj, section) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        var attributes = {
            state: actionDetailObj.getState(),
            parentId: actionDetailObj.getParentActionId()
        };
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.isRAHideEligible === "function") {
                        var allowHide = actionHandler.isRAHideEligible(attributes, section);
                        return allowHide;
                    }
                } catch (ex) {
                    this._log.error("Failed to get allowHide value of action type " + actionDetailRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());
    },

    _getHideActionResponse: function() {
        var response = {};
        response.actionStatus = sn_nb_action.Constants.STATUS_ERROR;
        response.statusCode = sn_nb_action.Constants.ERROR_405;
        response.errorMessage = sn_nb_action.Constants.RA_PERFORMED_MESSAGE;
        return response;
    },
    _setCallToActions: function(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetailObj) {
        var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandler(actionTypeRecord);
        if (actionHandler) {
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getActions === "function") {
                        var callToActions = actionHandler.getActions(actionRecord);
                        actionDetailObj.setCallToActions(callToActions);
                    }
                } catch (ex) {
                    this._log.error("Failed to get call to actions of recommended action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Error in implementing _setCallToActions");

    },
    _addCallToActions: function(currentRecord, actionDetailRecord, actionDetailObj) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getActions === "function") {
                        var callToActions = actionHandler.getActions(actionRecord);
                        actionDetailObj.setCallToActions(callToActions);
                    }
                } catch (ex) {
                    this._log.error("Failed to get call to actions of recommended action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

    },
    _getActionAttributes: function(actionDetailRecord) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getActionAttributes === "function") {
                        var actionAttributes = actionHandler.getActionAttributes(actionRecord, actionDetailRecord.getValue(sn_nb_action.Constants.COL_ATTRIBUTE));
                        return actionAttributes;
                    }
                } catch (ex) {
                    this._log.error("Failed to get action attributes of recommended action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

    },
    _setTitleAndDescription: function(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetailObj) {
        var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandler(actionTypeRecord);
        var title, desc;
        if (actionHandler) {
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getTitle === "function") {
                        title = actionHandler.getTitle(currentRecord, actionRecord, currentDetail.actionInputs, currentDetail.actionInputLabels);
                        if (sn_nb_action.NextBestActionUtil.isValidString(title))
                            actionDetailObj.setTitle(title);

                    }
                    if (actionHandler && typeof actionHandler.getDescription === "function") {
                        desc = actionHandler.getDescription(currentRecord, actionRecord, currentDetail.actionInputs, currentDetail.actionInputLabels);
                        if (sn_nb_action.NextBestActionUtil.isValidString(desc))
                            actionDetailObj.setDescription(desc);

                    }
                } catch (ex) {
                    this._log.error("Failed to get title/description of action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Error in implementing _setTitleAndDescription");

    },
    _addTitleAndDescription: function(currentRecord, actionDetailRecord, actionDetailObj) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getTitle === "function") {
                        var title = actionHandler.getTitle(currentRecord, actionRecord, actionDetailObj.getActionInputs(), actionDetailObj.getActionInputLabels());
                        if (sn_nb_action.NextBestActionUtil.isValidString(title))
                            actionDetailObj.setTitle(title);

                    }
                    if (actionHandler && typeof actionHandler.getDescription === "function") {
                        var desc = actionHandler.getDescription(currentRecord, actionRecord, actionDetailObj.getActionInputs(), actionDetailObj.getActionInputLabels());
                        if (sn_nb_action.NextBestActionUtil.isValidString(desc))
                            actionDetailObj.setDescription(desc);
                    }
                } catch (ex) {
                    this._log.error("Failed to get title/description of action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

    },

    _setCustomPreviewExperience: function(actionTypeRecord, actionRecord, currentRecord, actionDetailObj) {
        var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandler(actionTypeRecord);
        if (actionHandler) {
            try {
                if (typeof actionHandler.getPreviewExperience === "function") {
                    var previewExperience = actionHandler.getPreviewExperience(currentRecord, actionRecord);
                    actionDetailObj.setPreviewExperience(previewExperience);
                }
            } catch (ex) {
                this._log.error("Failed to get custom preview experience of action " + actionRecord.getUniqueValue());
            }
        } else
            this._log.error("Could not find implementation for action type");
    },

    _addCustomPreviewExpereince: function(currentRecord, actionDetailRecord, actionDetailObj) {

        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            try {
                if (typeof actionHandler.getPreviewExperience === "function") {
                    var previewExpereince = actionHandler.getPreviewExperience(currentRecord, actionRecord);
                    actionDetailObj.setPreviewExperience(previewExpereince);
                }
            } catch (ex) {
                this._log.error("Failed to get custom preview expereince of action " + actionRecord.getUniqueValue());
            }
        }
    },
    _setCustomAttributes: function(actionTypeRecord, actionRecord, currentRecord, currentDetail, actionDetailObj) {
        var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandler(actionTypeRecord);
        if (actionHandler) {
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getCustomAttributes === "function") {
                        var previewFields = actionHandler.getCustomAttributes(currentRecord, actionRecord, currentDetail.actionInputs, currentDetail.actionInputLabels);
                        actionDetailObj.setCustomAttribute(previewFields);
                    }
                } catch (ex) {
                    this._log.error("Failed to get custom attributes of action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type");

    },
    _addCustomAttributes: function(currentRecord, actionDetailRecord, actionDetailObj) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            var actionRecord = actionDetailRecord[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord)) {
                try {
                    if (typeof actionHandler.getCustomAttributes === "function") {
                        var previewFields = actionHandler.getCustomAttributes(currentRecord, actionRecord, actionDetailObj.getActionInputs(), actionDetailObj.getActionInputLabels());
                        actionDetailObj.setCustomAttribute(previewFields);
                    }
                } catch (ex) {
                    this._log.error("Failed to get custom attributes of action " + actionRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementaion for action type " + actionDetailRecord.getUniqueValue());

    },

    _getActionHandler: function(actionDetailRecord) {
        var actionTypeRecord = actionDetailRecord[sn_nb_action.Constants.COL_ACTION_TYPE].getRefRecord();
        return sn_nb_action.NextBestActionUtil.getActionTypeHandler(actionTypeRecord);
    },

    // Called by NextBestActionService to check if action can handle tablename of rule record.
    isActionAllowed: function(tableName, actionRecord) {
        var actionTableName = actionRecord.getValue(sn_nb_action.Constants.COL_SYS_CLASS_NAME);
        var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandlerForTable(actionTableName);
        if (actionHandler && typeof actionHandler.isActionAllowed === "function")
            return actionHandler.isActionAllowed(tableName, actionRecord);
        else
            this._log.error("Could not find the handler for action table name" + actionTableName);

        return false;
    },

    _sortByActionScore: function(a, b) {
        if (b.actionScore > a.actionScore)
            return 1;

        if (b.actionScore < a.actionScore)
            return -1;

        return 0;
    },

    // Append Action Details
    _appendActionDetails: function(actionDetails, actionDetailsNotInUse) {
        var length = actionDetailsNotInUse.length;
        for (var i = 0; i < length; i++)
            actionDetails.push(actionDetailsNotInUse[i]);

        return actionDetails;
    },




    _sortProperties: function(obj) {
        var sortable = [];
        for (var key in obj)
            if (obj.hasOwnProperty(key))
                sortable.push([
                    key, obj[key]
                ]);


        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        return sortable;
    },

    _compareByInterOrder: function(a, b) {
        if (a.getInterOrder() > b.getInterOrder())
            return 1;

        if (a.getInterOrder() < b.getInterOrder())
            return -1;

        return 0;
    },
    _getActionInputIds: function(actionInputs) {
        var inputObj = new Object();
        for (var attribute in actionInputs) {
            var element = actionInputs[attribute];
            if (element instanceof GlideRecord || element instanceof GlideRecordSecure)
                inputObj[attribute] = element.getUniqueValue();
            else
                inputObj[attribute] = element;

        }
        return inputObj;
    },
    errorOutAction: function(contextRecord, actionSysId, actionDetailSysId, actionInitialAttributes) {
        var actionDetailRecord;
        if (gs.nil(actionDetailSysId))
            actionDetailRecord = this.nextBestActionDAO.getActionDetail(contextRecord, actionSysId);
        else
            actionDetailRecord = this.nextBestActionDAO.getActionDetailBySysId(actionDetailSysId);


        var attributes = actionDetailRecord.getValue('attribute');
        if (actionDetailRecord.state != sn_nb_action.Constants.STATE_SKIPPED && actionInitialAttributes && actionInitialAttributes.id == sn_nb_action.Constants.TBL_DECISION_TREE && gs.nil(attributes)) {
            this.nextBestActionDAO.setActionAttribute(actionDetailRecord, actionInitialAttributes.attributes);
        }
        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            return this._changeState(actionDetailRecord, sn_nb_action.Constants.STATE_IN_ERROR);
        } else
            this._log.warn("Could not find action detail for action " + actionSysId);

        return false;
    },
    _addErrorMessage: function(actionDetailRecord, actionDetailObj) {
        var actionHandler = this._getActionHandler(actionDetailRecord);
        if (actionHandler) {
            if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
                try {
                    if (typeof actionHandler.getErrorMessage === "function") {
                        var errorMessage = actionHandler.getErrorMessage(actionDetailRecord.getValue(sn_nb_action.Constants.COL_ATTRIBUTE));
                        if (sn_nb_action.NextBestActionUtil.isValidString(errorMessage))
                            actionDetailObj.setErrorMessage(errorMessage);

                    }
                } catch (ex) {
                    this._log.error("Failed to get error message of action " + actionDetailRecord.getUniqueValue());
                }
            }
        } else
            this._log.error("Could not find implementation for action type " + actionDetailRecord.getUniqueValue());

    },
    type: 'ActionServiceImpl'
};
