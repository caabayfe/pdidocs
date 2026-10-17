var PDRawActivityUtil = Class.create();
PDRawActivityUtil.prototype = {
    initialize: function() {
        this.assetId;
        this.assetConfigurationId;
        this.activityType = PDConstants.RAW_ASSETS.TYPE_ACTIVITY_DEFINITION;
        this.activityDefinition;
        this.defintitionCreated = false;
        this.needsInputSet = false;
    },

    type: 'PDRawActivityUtil',


    processActivity: function(fields) {
        this.activityType = fields[PDConstants.FIELDS.TYPE];
        if (this.activityType === PDConstants.RAW_ASSETS.TYPE_RAW_ASSET) {
            this.assetId = fields[PDConstants.FIELDS.ASSET_ID];
			this.assetLabel=fields[PDConstants.FIELDS.ASSET_LABEL];
            this.assetConfigurationId = fields[PDConstants.FIELDS.ASSET_CONFIGURTION_ID];
            this.activityDefinition = fields[PDConstants.RAW_ASSETS.RAW_ACTIVITY_DEFINITION_FIELD];
            if (this.assetId && this.assetConfigurationId) {
                var configGr = this._getAssetConfiguration(this.assetConfigurationId);
                if (configGr) {
                    var definedActivityDefinition = configGr.getValue(PDConstants.FIELDS.GENERIC_ACTIVITY_DEFININITION_LAUNCHER);
                    if (definedActivityDefinition) { // we have a definition defined in config
                        this.activityDefinition = definedActivityDefinition;
                        this.needsInputSet = true;
                    } else { //no definition defined so create or use one
                        var tableName = configGr.getValue(PDConstants.FIELDS.TABLE);
                        this.activityDefinition = this._getOrCreateActivityDefnitionForSource(this.assetLabel, this.assetId, tableName);
                    }
                    fields[PDConstants.RAW_ASSETS.RAW_ACTIVITY_DEFINITION_FIELD] = this.activityDefinition;
                }
            }
        }
    },

    processInputs: function(insertedGr) {
        if (this.needsInputSet) {
            this._setActivityInput(insertedGr, this.assetConfigurationId, this.assetId);
        }
    },

    _setActivityInput: function (insertedGr, configId, genericActivityResourceId) {
        var configGr = this._getAssetConfiguration(configId);
        if (configGr) {
            var assetIdVar = this._findAssetInputName(configGr.getValue(PDConstants.FIELDS.TABLE));
            if (assetIdVar) {
                var fieldName = PDConstants.FIELDS.INPUTS;
                var ge = insertedGr.getElement(fieldName);
                var variablesRecord = ge.getVariablesRecord();
                variablesRecord.setValue(assetIdVar, genericActivityResourceId);
                var gegv = ge[assetIdVar];
                gegv.setValueMapping('');
                variablesRecord.update();
                insertedGr.update();
            }
        }
    },

    _getAssetConfiguration: function(configId) {
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY_ASSET_CONFIGURATION_TABLE);
        gr.get(configId);

        if (gr.isValidRecord())
            return gr;

        return null;
    },
    _getOrCreateActivityDefnitionForSource: function(label, sourceId, sourceTable) {
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY_DEFINITION);
        gr.addQuery(PDConstants.FIELDS.SOURCE, sourceId);
        gr.addQuery(PDConstants.FIELDS.ACTIVE, false);
        gr.addQuery(PDConstants.FIELDS.CATEGORY, PDConstants.RAW_ASSETS.ACTIVITY_DEFINITION_CATEGORY);
        gr.query();
        if (gr.next()) {
            return gr.getUniqueValue();
        }

        // if label is undefined, get source table (sys_hub_flow ,etc) and look up label
        if (label === undefined) {
            var sourceGr = new GlideRecord(sourceTable);
            sourceGr.get(sourceId);
            label = sourceGr.getValue(PDConstants.FIELDS.NAME);
        }

        //create new
        gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_DEFINITION);
        gr.initialize();

        gr.setValue(PDConstants.FIELDS.ACTIVE, false);
        gr.setValue(PDConstants.FIELDS.LABEL, label);
        gr.setValue(PDConstants.FIELDS.SOURCE, sourceId);
        gr.setValue(PDConstants.FIELDS.SOURCE_TYPE, sourceTable);
        gr.setValue(PDConstants.FIELDS.CATEGORY, PDConstants.RAW_ASSETS.ACTIVITY_DEFINITION_CATEGORY);
        this._setInputPreferences(gr);
        this.defintitionCreated = true;
        return gr.insert();
    },

    _findAssetInputName: function(targetTable) {
        var adGr = this._getActivityDefinitionGr();
        var sourceTable = adGr.getValue(PDConstants.FIELDS.SOURCE_TYPE);
        var table = this._getInputTable(sourceTable);
        var assetGR = GlideRecord(table);
        assetGR.addQuery(PDConstants.FIELDS.MODEL, adGr.getValue(PDConstants.FIELDS.SOURCE));
        assetGR.query();
        while (assetGR.next()) {
            var type = assetGR.getValue(PDConstants.FIELDS.INTERNAL_TYPE);
            if (type === PDConstants.RAW_ASSETS.INPUT_TYPE_REFERENCE) {
                var refTable = assetGR.getValue(PDConstants.FIELDS.REFERENCE);
                if (targetTable === refTable) {
                    return assetGR.getValue(PDConstants.FIELDS.ELEMENT);
                }
            }
        }
    },

    _setInputPreferences: function(adGr) {
        var sourceTable = adGr.getValue(PDConstants.FIELDS.SOURCE_TABLE);
        var table = this._getInputTable(sourceTable);
        var assetGR = GlideRecord(table);
        assetGR.addQuery(PDConstants.FIELDS.MODEL, adGr.getValue(PDConstants.FIELDS.SOURCE));
        assetGR.query();
        var prefsString = '';
        while (assetGR.next()) {
            prefsString += assetGR.getValue(PDConstants.FIELDS.ELEMENT) + "=all;";
        }
        if (prefsString.length > 0)
            adGr.setValue(PDConstants.FIELDS.INITIAL_DISPLAY_PREFERENCES, prefsString);
    },

	_getInputTable: function(sourceTable) {
		return sourceTable === PDConstants.RAW_ASSETS.TABLE_ACTION ? PDConstants.RAW_ASSETS.TABLE_ACTION_INPUT : PDConstants.RAW_ASSETS.TABLE_FLOW_INPUT;
	},

    _getActivityDefinitionGr: function() {
        var gr = GlideRecord(PDConstants.TABLES.PD_ACTIVITY_DEFINITION);
        gr.get(this.activityDefinition);
        return gr;
    }
};
