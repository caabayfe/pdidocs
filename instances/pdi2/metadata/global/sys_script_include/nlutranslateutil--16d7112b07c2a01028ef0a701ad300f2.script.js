var NLUTranslateUtil = Class.create();

(function() {
    var tables = NLUConstants.tables;
    var constants = NLUConstants.constants;

    NLUTranslateUtil.canRequestTranslations = function(modelId) {
        return !NLUModel.isInCloneOrTranslation(modelId);
    };

    NLUTranslateUtil.getTranslatedRecord = function(tableName, modelId, primaryId) {
        var primaryField = NLUImportUtil.FIELDS_DATA[tableName].primaryField;
        var gr = null;
        if (tableName === tables.SYS_NLU_ENTITY) {
            gr = new NLUModel(modelId).getEntities(primaryField + '=' + primaryId);
        } else {
            gr = new GlideRecord(tableName);
            gr.addQuery(primaryField, primaryId);
            gr.addQuery((tableName === tables.SYS_NLU_UTTERANCE ? 'intent.' : '') + 'model', modelId);
            gr.query();
        }
        return gr && gr.next() && gr;
    };

    NLUTranslateUtil.getTranslationOptions = function(languages) {
        var translationOptions = [];
        try {
            if (!languages) languages = NLUParloIntegrator.getSupportedLanguageCodes();
            if (!GlidePluginManager.isActive("com.glide.localization_framework")) return translationOptions;
            var lfAPI = new global.LocalizationFrameworkAPIV2();
            var result = lfAPI.getTranslationPreferences(constants.NLU_ARTIFACT_NAME, {
                "targetLanguages": languages
            });
            Object.keys(result).forEach(function(langCode) {
                var langOption = result[langCode];
                translationOptions.push({
                    code: langCode,
                    thirdPartyTranslate: langOption.exists,
                    machineTranslate: langOption.machineTranslate ? langOption.machineTranslate.isEnabled : false,
                    exportImport: langOption.exportImport ? langOption.exportImport.isEnabled : false
                });
            });
        } catch (e) {
            gs.error('Error while getting getTranslationPreferences: ' + e.message);
        }
        return translationOptions;
    };

    NLUTranslateUtil.getLfRequestedItemGr = function(details) {
        var tableName = tables.SN_LF_REQUESTED_ITEM;
        if (details.number && details.number.includes("LFTASK")) tableName = tables.SN_LF_TASK;
        var gr = new GlideRecord(tableName);
        gr.addQuery('sys_id', details.sysId);
        gr.query();
        return gr.next() && gr;
    };

    NLUTranslateUtil.getLfRequestedItemDetails = function(sysIds, languages) {
        var lfRequestedItemDetails = [];
        var canRead = false;
        try {
            if (!GlidePluginManager.isActive("com.glide.localization_framework")) return lfRequestedItemDetails;
            var lfAPI = new global.LocalizationFrameworkAPIV2();
            var result = lfAPI.getRequestedItemDetails(sysIds, {
                "targetLanguages": languages
            });
            Object.keys(result).forEach(function(modelId) {
                var _result = result[modelId];
                Object.keys(_result).forEach(function(langCode) {
                    var details = _result[langCode].details;
                    if (details) {
                        var lfRequestedItemGr = NLUTranslateUtil.getLfRequestedItemGr(details);
                        canRead = lfRequestedItemGr.canRead();
                    }
                    lfRequestedItemDetails.push({
                        modelSysId: modelId,
                        language: langCode,
                        exists: _result[langCode].exists,
                        canRead: canRead,
                        details: details,
                    });
                });

            });
        } catch (e) {
            gs.error('Error while getting requested item details: ' + e.message);
        }
        return lfRequestedItemDetails;

    };

    NLUTranslateUtil.prototype = {
        initialize: function(tgtNluModel) {
            this.dataMap = {};
            this.tgtNluModel = tgtNluModel;
        },

        loadPrimaryTranslatedData: function() {
            this.dataMap[tables.SYS_NLU_MODEL] = {};
            var primaryField = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].primaryField;
            var translatableFields = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].translatableFields;
            this._populateRecord(tables.SYS_NLU_MODEL, this.tgtNluModel.getGR(),
                primaryField, translatableFields);

            this._populateDataMap(tables.SYS_NLU_VOCABULARY, this.tgtNluModel.getVocabulary());
            this._populateDataMap(tables.SYS_NLU_ENTITY, this.tgtNluModel.getModelEntities());
            this._populateDataMap(tables.SYS_NLU_ENTITY, this.tgtNluModel.getEntities());
            this._populateDataMap(tables.SYS_NLU_INTENT, this.tgtNluModel.getIntents());
            this._populateDataMap(tables.SYS_NLU_UTTERANCE, this.tgtNluModel.getUtterances());

            return this.dataMap;
        },

        getTgtData: function(tableName, srcSysId) {
            return this.dataMap.hasOwnProperty(tableName) &&
                this.dataMap[tableName].hasOwnProperty(srcSysId) &&
                this.dataMap[tableName][srcSysId];
        },

        getTgtValue: function(tableName, srcSysId, field) {
            var tgtData = this.getTgtData(tableName, srcSysId);
            return tgtData && tgtData[field];
        },

        getTgtSysId: function(tableName, srcSysId) {
            return this.getTgtValue(tableName, srcSysId, 'sys_id');
        },

        setTgtSysId: function(tableName, srcSysId, tgtSysId) {
            if (!this.dataMap.hasOwnProperty(tableName)) this.dataMap[tableName] = {};
            if (!this.dataMap[tableName].hasOwnProperty(srcSysId)) this.dataMap[tableName][srcSysId] = {};
            this.dataMap[tableName][srcSysId]['sys_id'] = tgtSysId;
        },

        _populateDataMap: function(tableName, gr) {
            if (!this.dataMap.hasOwnProperty(tableName)) this.dataMap[tableName] = {};
            var primaryField = NLUImportUtil.FIELDS_DATA[tableName].primaryField;
            var translatableFields = NLUImportUtil.FIELDS_DATA[tableName].translatableFields;
            while (gr.next()) {
                this._populateRecord(tableName, gr, primaryField, translatableFields);
            }
        },

        _populateRecord: function(tableName, gr, primaryField, translatableFields) {
            var tgtData = {
                sys_id: gr.getUniqueValue()
            };
            translatableFields && translatableFields.forEach(function(field) {
                tgtData[field] = gr.getValue(field);
            });
            this.dataMap[tableName][gr.getValue(primaryField)] = tgtData;
        },


        type: 'NLUTranslateUtil'
    };
})();
