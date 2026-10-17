var TrendDefinitionService = Class.create();
TrendDefinitionService.prototype = {
    tableName: Constants.TBL_TREND_DEFINITION,
    ids: "ids",

    initialize: function(grOrSysId) {
        if (grOrSysId && grOrSysId.sys_class_name == this.tableName && grOrSysId.isValidRecord) {
            this.trendDefinition = grOrSysId;
        } else {
            var trendDefinitionGr = new GlideRecord(this.tableName);
            if (trendDefinitionGr.get(grOrSysId)) {
                this.trendDefinition = trendDefinitionGr;
            }
        }
    },

    hasValidRecord: function() {
        return this.trendDefinition && this.trendDefinition.sys_class_name == this.tableName && this.trendDefinition.isValidRecord();
    },

    getTrendDefinitionId: function() {
        return this.trendDefinition.getValue(Constants.COL_SYS_ID);
    },

    isActive: function() {
        return this.trendDefinition.getValue(Constants.COL_ACTIVE) == "1";
    },

    getInputTable: function() {
        return this.trendDefinition.getValue(Constants.COL_INPUT_TABLE);
    },

    getThreshold: function() {
        return this.trendDefinition.getValue(Constants.COL_THRESHOLD);
    },

    getType: function() {
        return this.trendDefinition.getValue(Constants.COL_TYPE);
    },

    getCommonValueField: function() {
        return this.trendDefinition.getValue(Constants.COL_COMMON_VALUE_FIELD);
    },

    getCommonValueFieldType: function() {
        var inputTableGR = new GlideRecord(this.getInputTable());
        if (inputTableGR.isValid()) {
            var field = inputTableGR.getElement(this.getCommonValueField());
            if (field != null) {
                return field.getED().getInternalType();
            }
        }
    },

    getCommonValueFieldReferenceTable: function() {
        var inputTableGR = new GlideRecord(this.getInputTable());
        if (inputTableGR.isValid()) {
            var field = inputTableGR.getElement(this.getCommonValueField());
            if (field != null) {
                return field.getED().getReference();
            }
        }
    },

    getReferenceTable: function() {
        return this.trendDefinition.getValue(Constants.COL_REFERENCE_TABLE);
    },

    getInputField: function() {
        return this.trendDefinition.getValue(Constants.COL_INPUT_FIELD);
    },

    getCommonReferenceField: function() {
        return this.trendDefinition.getValue(Constants.COL_COMMON_REFERENCE_FIELD);
    },

    getConditionBuilder: function() {
        return this.trendDefinition.getValue(Constants.COL_CONDITION_BUILDER);
    },

    getSourceTable: function() {
        var trendType = this.getType();
        if (trendType == Constants.TREND_TYPE_GROUP_BY_VALUE) {
            return this.getCommonValueFieldReferenceTable();
        } else if (trendType == Constants.TREND_TYPE_GROUP_BY_REFERENCE) {
            return NextBestActionUtil.getFieldReferenceTable(this.getReferenceTable(), this.getCommonReferenceField());
        }
    },

    getTrendResult: function(recordSysIds) {
        this.recordSysIds = recordSysIds;
        this.isTrendConfigValid = true;
        this.trendData = [];
        this._buildRecordsAgeMap();

        switch (this.getType()) {
            case Constants.TREND_TYPE_GROUP_BY_VALUE:
                this._processCommonValue();
                break;
            case Constants.TREND_TYPE_GROUP_BY_REFERENCE:
                this._processCommonReference();
                break;
            case Constants.TREND_TYPE_COMMON_CONDITION:
                this._processCommonCondition();
                break;
        }
        if (!this.isTrendConfigValid) {
            var errorDetails = new RAExceptionManager("INVALID_TREND_DEFINITION_CONFIG");
            var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, "TrendDefinitionService");
            logger.error("Trend definition " + this.getTrendDefinitionId() + " has invalid configuration");
            return {
                "status": Constants.STATUS_ERROR,
                "errorCode": errorDetails.getCode(),
                "errorMessage": errorDetails.getMessage()
            };
        }
        return {
            "status": Constants.STATUS_SUCCESS,
            "trendData": this.trendData
        };
    },

    _buildRecordsAgeMap: function() {
        this.recordsAgeMap = {};
        var gr = new GlideRecord(this.getInputTable());
        gr.addQuery("sys_id", "IN", this.recordSysIds);
        gr.query();
        while (gr.next()) {
            this.recordsAgeMap[gr.getValue(Constants.COL_SYS_ID)] = gr.getValue(Constants.COL_SYS_CREATED_ON);
        }
    },

    _processCommonValue: function() {
        var commonValueField = this.getCommonValueField();
        this._getCommonValueOrCommonReferenceResults(this.getInputTable(), commonValueField, Constants.COL_SYS_ID);
    },

    _processCommonReference: function() {
        var commonReferenceFieldReferenceTable = NextBestActionUtil.getFieldReferenceTable(this.getReferenceTable(), this.getCommonReferenceField());
        var inputFieldReferenceTable = NextBestActionUtil.getFieldReferenceTable(this.getReferenceTable(), this.getInputField());
        if (!commonReferenceFieldReferenceTable || !inputFieldReferenceTable) {
            this.isTrendConfigValid = false;
            return;
        }
        this._getCommonValueOrCommonReferenceResults(this.getReferenceTable(), this.getCommonReferenceField(), this.getInputField());
    },

    _processCommonCondition: function() {
        var conditions = this.getConditionBuilder();
        var recordsGr = new GlideRecord(this.getInputTable());
        recordsGr.addQuery(Constants.COL_SYS_ID, "IN", this.recordSysIds);
        if (conditions) {
            recordsGr.addEncodedQuery(conditions);
        }
        recordsGr.query();
        if (recordsGr.getRowCount() >= this.getThreshold()) {
            this._getCommonConditionResults(recordsGr);
        }
    },

    _getCommonConditionResults: function(recordsGr) {
        var ids = [];
        while (recordsGr.next()) {
            var sysId = recordsGr.getValue(Constants.COL_SYS_ID);
            ids.push(sysId);
        }
        var groupDetails = this._getGroupDetails(ids);
        var groupData = {};
        groupData[Constants.TREND_DATA_COUNT] = ids.length;
        groupData[Constants.TREND_DATA_OLDEST_RECORD] = groupDetails[Constants.TREND_DATA_OLDEST_RECORD];
        groupData[Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD] = groupDetails[Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD];
        groupData[Constants.QUALIFIED_RECORD_IDS] = JSON.stringify(ids);
        this.trendData = [groupData];
    },

    _getCommonValueOrCommonReferenceResults: function(queryTable, groupField, queryField) {
        var groupMap = {};
        var gr = new GlideRecord(queryTable);
        gr.addQuery(queryField, "IN", this.recordSysIds);
        gr.addNotNullQuery(groupField);
        gr.query();
        while (gr.next()) {
            var groupKey = gr.getElement(groupField).toString();
            if (!groupMap[groupKey]) {
                groupMap[groupKey] = {};
                groupMap[groupKey][this.ids] = [];
                groupMap[groupKey][Constants.TREND_DATA_DISPLAY_VALUE] = gr.getElement(groupField).getDisplayValue();
            }
            groupMap[groupKey][this.ids].push(gr.getValue(queryField));
        }

        var resultList = [];
        var isCommonValueNonReference = (this.getType() == Constants.TREND_TYPE_GROUP_BY_VALUE) && (this.getCommonValueFieldType() != Constants.FIELD_TYPE_REFERENCE);
        for (var key in groupMap) {
            if (groupMap[key][this.ids].length < this.getThreshold()) {
                continue;
            }
            var ids = groupMap[key][this.ids];

            var groupDetails = this._getGroupDetails(ids);
            var groupData = {};
            groupData[Constants.TREND_DATA_COUNT] = ids.length;
            groupData[Constants.TREND_DATA_OLDEST_RECORD] = groupDetails[Constants.TREND_DATA_OLDEST_RECORD];
            groupData[Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD] = groupDetails[Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD];
            groupData[Constants.QUALIFIED_RECORD_IDS] = JSON.stringify(ids);

            if (isCommonValueNonReference) {
                groupData[Constants.TREND_DATA_DISPLAY_VALUE] = groupMap[key][Constants.TREND_DATA_DISPLAY_VALUE];
                groupData[Constants.TREND_DATA_VALUE] = key;
            } else {
                groupData[Constants.TREND_DATA_SOURCE_RECORD] = key;
            }
            resultList.push(groupData);
        }
        resultList.sort(function(a, b) {
            return b.count - a.count;
        });
        this.trendData = resultList;
    },

    _getGroupDetails: function(ids) {
        //It returns the oldest created record and the highest ML confidence record in trend group
        var oldestCreatedAt = (new GlideDateTime()).toString();
        var oldestRecordSysId = ids[0];
        var highestConfidenceRecordIdx = this.recordSysIds.length;
        for (var i = 0; i < ids.length; i++) {
            var sysId = ids[i];
            if (this.recordsAgeMap[sysId] < oldestCreatedAt) {
                oldestCreatedAt = this.recordsAgeMap[sysId];
                oldestRecordSysId = sysId;
            }
            // Find index of the record in 'recordSysIds' list, having highest ML confidence among all of the records in 'ids' list
            var sysIdIndex = this.recordSysIds.indexOf(sysId);
            if (sysIdIndex < highestConfidenceRecordIdx) {
                highestConfidenceRecordIdx = sysIdIndex;
            }
        }
        var groupDetails = {};
        groupDetails[Constants.TREND_DATA_OLDEST_RECORD] = oldestRecordSysId;
        groupDetails[Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD] = this.recordSysIds[highestConfidenceRecordIdx];
        return groupDetails;
    },

    type: "TrendDefinitionService"
};
