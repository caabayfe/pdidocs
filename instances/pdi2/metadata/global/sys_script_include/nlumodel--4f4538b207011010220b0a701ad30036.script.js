var NLUModel = Class.create();

(function() {

    var constants = NLUConstants.constants;
    var tables = NLUConstants.tables;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;
    var primaryField = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].primaryField;

    NLUModel.isInCloning = function(modelId) {
        var statusGr = NLUModel.getModelStatusGr(modelId);
        if (statusGr) {
            var modelState = statusGr.getValue('state');
            if (modelState === stateTypes.cloning) {
                return true;
            }
        }
        return false;
    };

    NLUModel.isInCloneOrTranslation = function(modelId) {
        var statusGr = NLUModel.getModelStatusGr(modelId);
        if (statusGr) {
            var modelState = statusGr.getValue('state');
            if (modelState === stateTypes.cloning || modelState === stateTypes.translating) {
                return true;
            }
        }
        return false;
    };

    NLUModel.deleteModel = function(modelId) {
        var gr = new GlideRecordSecure(tables.SYS_NLU_MODEL);
        gr.addQuery('sys_id', modelId);
        gr.query();
        if (gr.next())
            gr.deleteRecord();
    };

    NLUModel.getModelsGr = function(modelId, languages) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        var query = 'sys_id=' + modelId;
        if (!NLUHelper.isEmpty(languages)) {
            query += '^ORprimary_model.sys_id=' + modelId + '^languageIN' + languages.join(',');
            if (languages.indexOf('en') !== -1) query += '^ORlanguageISEMPTY';
        }
        gr.addEncodedQuery(query);
        gr.query();
        return gr;
    };

    NLUModel.getModelStatusGr = function(modelId) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL_STATUS);
        return gr.get('model', modelId) && gr;
    };

    NLUModel.getGRByName = function(modelNames) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        gr.addQuery('name', 'IN', modelNames);
        gr.query();
        if (gr.next())
            return gr;
        return null;
    };

    NLUModel.getGRById = function(modelId) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (gr.get(modelId)) return gr;

        return null;
    };

    NLUModel.getByScope = function(sysScope, filter) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        gr.addQuery('sys_scope', sysScope);
        if (filter) gr.addEncodedQuery(filter);
        gr.query();

        return gr;
    };

    NLUModel.getReferenceTableKey = function(tableName) {
        switch (tableName) {
            case tables.SYS_NLU_MODEL:
                return 'sys_id';
            case tables.SYS_NLU_UTTERANCE:
            case tables.M2M_SYS_NLU_INTENT_ENTITY:
                return 'intent.model';
            case tables.M2M_SYS_NLU_UTTERANCE_ENTITY:
                return 'utterance.intent.model';
            default:
                return 'model';
        }
    };

    NLUModel.getLastUpdatedOn = function(modelId) {
        var modelTables = [tables.SYS_NLU_MODEL, tables.SYS_NLU_INTENT, tables.SYS_NLU_ENTITY, tables.SYS_NLU_VOCABULARY, tables.SYS_NLU_UTTERANCE, tables.M2M_SYS_NLU_UTTERANCE_ENTITY, tables.M2M_SYS_NLU_MODEL_SYS_ENTITY];
        var overallUpdatedOn = null;
        modelTables.forEach(function(eachTable) {
            var key = NLUModel.getReferenceTableKey(eachTable);
            var modelUpdatedOn = NLUSystemUtil.getLastUpdatedOn(eachTable, key + '=' + modelId);
            gs.info("NLUModel.getLastUpdatedOn: " + eachTable + " (" + key + "=" + modelId + ") " + modelUpdatedOn);
            overallUpdatedOn = NLUHelper.getLatestDate(overallUpdatedOn, modelUpdatedOn);
        });
        return overallUpdatedOn;
    };

    NLUModel.isAssignedToMe = function(modelId) {
        if (!modelId) return false;
        var modelStatusGr = NLUModel.getModelStatusGr(modelId);
        if (modelStatusGr) {
            var userIds = modelStatusGr.getValue('author') || '';
            userIds = userIds.split(',');
            var loggedInUser = gs.getUserID();
            return userIds.indexOf(loggedInUser) != -1;
        }
        return false;
    };

    NLUModel.updateModelStatus = function(modelId, state) {
        return NLUSystemUtil.updateOrInsert(tables.SYS_NLU_MODEL_STATUS,
            'model', modelId, {
                'state': state
            });
    };

    NLUModel.updateSecondaryModelStatus = function(modelId, langSysId, status) {
        var langCode = NLUSystemUtil.getLanguageCode(langSysId);
        if (langCode) {
            var nluModel = new NLUModel(modelId);
            var secModelGr = nluModel.getTranslatedModels(langCode);
            if (secModelGr.next()) {
                return NLUModel.updateModelStatus(secModelGr.getUniqueValue(), status);
            }
        }
        return null;
    };

    NLUModel.deriveModelStatus = function(modelId) {
        var gr = NLUModel.getModelStatusGr(modelId);
        if (gr) {
            var updatedOn = gr.getValue('model_updated_on');
            var trainedOn = gr.getValue('last_trained_on');
            var publishedOn = gr.getValue('last_published_on');
            updatedOn = updatedOn ? updatedOn.getNumericValue() : 0;
            trainedOn = trainedOn ? trainedOn.getNumericValue() : 0;
            publishedOn = publishedOn ? publishedOn.getNumericValue() : 0;
            var newState = stateTypes.draft;
            if (trainedOn > publishedOn) {
                newState = stateTypes.trained;
            } else if (publishedOn !== 0) {
                newState = stateTypes.published;
            }
            if (gr.getValue('state') !== newState) {
                gr.setValue('state', newState);
                gr.update();
            }
        }
    };

    NLUModel.getLanguage = function(modelGr) {
        return modelGr.getValue('language') || constants.MODEL_DEFAULT_LANG;
    };

    NLUModel.prototype = {

        type: 'NLUModel',

        initialize: function(modelId, modelGr) {
            this.modelId = modelId;
            this.modelGr = modelGr;
        },

        createIntent: function(name) {
            if (!name || name.length === 0) throw new Error(gs.getMessage("Please provide a valid intent name"));
            if (name.length > 100) throw new Error(gs.getMessage("Intent name cannot be more than 100 characters"));
            if (this.getPolicy() === 'read') throw new Error(gs.getMessage('Intent cannot be added to read only model {0}', this.getModelDisplayName()));
            var intentGr = this.getIntents('name=' + name);
            if (intentGr.next()) throw new Error(gs.getMessage('Intent with same name already exists'));
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.initialize();
            gr.name = name;
            gr.model = this.modelId;
            return gr.insert();
        },

        getGR: function() {
            if (!this.modelGr) this.modelGr = NLUModel.getGRById(this.modelId);
            return this.modelGr;
        },

        getScope: function() {
            if (!this.modelGr) this.getGR();
            return this.modelGr.getValue('sys_scope');
        },

        getModelDisplayName: function() {
            return this.getGR().getValue('display_name');
        },

        getPolicy: function() {
            return this.getGR().getValue('sys_policy');
        },

        getVersion: function() {
            if (!this.parloIntegrator) this.parloIntegrator = new NLUParloIntegrator(this.getGR());
            return this.parloIntegrator.getModelVersion();
        },

        getStatus: function() {
            return NLUModel.getModelStatusGr(this.modelId);
        },

        syncStatus: function() {
            var lastPublishedOrTrained, statusGr, modelUpdatedOn, dirty;
            var data = {
                state: 'draft'
            };

            if (!this.parloIntegrator) this.parloIntegrator = new NLUParloIntegrator(this.getGR());
            var result = this.parloIntegrator.getModelStatus();
            if (result && result.status === 'success') {
                data = {
                    trained_version: result.trainedVersion,
                    published_version: result.publishedVersion
                };
                if (result.lastPublishedOn) {
                    data['last_published_on'] = result.lastPublishedOn;
                    lastPublishedOrTrained = new GlideDateTime(result.lastPublishedOn);
                }
                if (result.lastTrainedOn) {
                    data['last_trained_on'] = result.lastTrainedOn;
                    lastPublishedOrTrained = NLUHelper.getLatestDate(lastPublishedOrTrained, new GlideDateTime(result.lastTrainedOn));
                }
                statusGr = this.getStatus();
                var oldState = statusGr && statusGr.getValue('state');
                var newState = result.state;
                if (!statusGr) {
                    // In case, the model_status does not exists:
                    modelUpdatedOn = NLUModel.getLastUpdatedOn(this.modelId);
                    data['model_updated_on'] = modelUpdatedOn;
                } else {
                    if (oldState === stateTypes.training || newState === stateTypes.trained || newState === stateTypes.published) {
                        modelUpdatedOn = new GlideDateTime(statusGr.getValue('model_updated_on'));
                    }
                }
                if (modelUpdatedOn) {
                    dirty = !lastPublishedOrTrained || (modelUpdatedOn.getNumericValue() > lastPublishedOrTrained.getNumericValue());
                    data['dirty'] = dirty;
                }

                if ([stateTypes.training, stateTypes.trained, stateTypes.published, stateTypes.draft].indexOf(oldState) !== -1) {
                    data.state = result.state;
                }
            }
            this.updateStatus(data);
            return result;
        },

        getPublishedTimestamp: function() {
            var modelStatus = this.syncStatus();
            return !gs.nil(modelStatus) && !gs.nil(modelStatus.lastPublishedOn) ?
                new GlideDateTime(modelStatus.lastPublishedOn).getValue() : null;
        },

        getLastTrainedTimestamp: function() {
            var modelStatus = this.syncStatus();
            return !gs.nil(modelStatus) && !gs.nil(modelStatus.lastTrainedOn) ?
                new GlideDateTime(modelStatus.lastTrainedOn).getValue() : null;
        },

        getIntents: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.addQuery('model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getIntentIds: function(filter) {
            var intentIds = [];
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.addQuery('model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();
            while (gr.next()) {
                intentIds.push(gr.getUniqueValue());
            }
            return intentIds;
        },

        getUtterances: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
            gr.addQuery('intent.model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getEntities: function(filter, enabled) {
            var gr = new GlideRecord(tables.SYS_NLU_ENTITY);
            var joinQuery = gr.addJoinQuery(tables.M2M_SYS_NLU_INTENT_ENTITY, 'sys_id', 'entity');
            if (enabled) {
                joinQuery.addCondition('intent.enable', true).addOrCondition('intent.enable', 'NULL');
            }
            joinQuery.addCondition('intent.model', this.modelId);
            gr.addEncodedQuery('^NQmodel=' + this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getModelEntities: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_ENTITY);
            gr.addQuery('model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getSystemEntities: function() {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY);
            gr.addQuery('model', this.modelId);
            gr.addQuery('active', true);
            gr.query();

            var sysEntities = [];
            while (gr.next()) {
                var entity = gr.getValue('entity');
                if (gs.nil(entity)) entity = gr.sys_entity.getRefRecord().getValue('name');
                sysEntities.push({
                    id: gr.getUniqueValue(),
                    name: entity,
                    createdOnTimestamp: global.NLUHelper.toTimezoneAdjustedTimestamp(
                        new GlideDateTime(gr.getValue('sys_created_on'))),
                });
            }
            return sysEntities;
        },

        getVocabulary: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_VOCABULARY);
            gr.addQuery('model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getDefaultTestsetGR: function(filter) {
            var gr = new GlideRecord(tables.BATCH_TEST_SET);
            gr.addQuery('model', this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getDefaultTestsetUtterancesGR: function(filter) {
            gr = new GlideRecord(tables.BATCH_TEST_SET_UTTERANCES);
            gr.addEncodedQuery('test_set.model=' + this.modelId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getLookupIds: function() {
            var lookupIds = [];
            var lookupGr = new GlideRecord(tables.SYS_NLU_VOCABULARY);
            lookupGr.addEncodedQuery('type=lookup^ORtype=static_lookup');
            lookupGr.query();
            var queryCondition = "utteranceLIKEjavascript:' @{0} '^ORutteranceSTARTSWITHjavascript:'@{0} '^ORutteranceENDSWITHjavascript:' @{0}'^ORutterance=javascript:'@{0}'";
            while (lookupGr.next()) {
                var utteranceGr = this.getUtterances(queryCondition.replaceAll("{0}", lookupGr.getValue('name')));
                if (utteranceGr.next() || this.getEntities('lookup=' + lookupGr.getUniqueValue() + '^type=list').next()) {
                    lookupIds.push(lookupGr.getUniqueValue());
                }
            }
            return lookupIds;
        },

        getLookups: function() {
            var gr = new GlideRecord(tables.SYS_NLU_VOCABULARY);
            gr.addQuery('sys_id', 'IN', this.getLookupIds());
            gr.query();
            return gr;
        },

        getState: function() {
            var result = this.syncStatus();
            switch (result.state) {
                case 'trained':
                    return gs.getMessage('Trained');
                case 'published':
                    return gs.getMessage('Published');
                default:
                    return gs.getMessage('Draft');
            }
        },

        updateStatus: function(data) {
            NLUSystemUtil.updateOrInsert(tables.SYS_NLU_MODEL_STATUS,
                'model', this.modelId, data);
        },

        setDirty: function() {
            this.updateStatus({
                dirty: true,
                model_updated_on: (new GlideDateTime())
            });
        },

        enableSysEntity: function(entity) {
            var entityRec = new GlideRecord(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY);
            entityRec.setValue('model', this.modelId);
            entityRec.setValue('entity', entity);
            entityRec.setValue('active', true);
            return entityRec.insert();
        },

        getTranslatedModels: function(language) {
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery(primaryField, this.modelId);
            if (language) gr.addQuery('language', language);
            gr.query();
            return gr;
        },
    };

})();
