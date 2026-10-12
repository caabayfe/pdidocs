var NLUCloneModel = Class.create();

(function() {

    var constants = NLUConstants.constants;
    var tables = NLUConstants.tables;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;

    var getIntentFilter = function(filter) {
        return filter && Array.isArray(filter.intents) &&
            'sys_idIN' + filter.intents.join(',');
    };

    var getUtteranceFilter = function(filter) {
        var utteranceFilter = null;
        if (filter && Array.isArray(filter.intents))
            utteranceFilter = 'intentIN' + filter.intents.join(',');
        if (filter && Array.isArray(filter.utterances))
            utteranceFilter = (utteranceFilter ? utteranceFilter + '^' : '') + 'sys_idIN' + filter.utterances.join(',');

        return utteranceFilter;
    };

    NLUCloneModel.canCloneModel = function(modelId) {
        return !NLUModel.isInCloneOrTranslation(modelId);
    };

    NLUCloneModel.prototype = {

        type: 'NLUCloneModel',

        initialize: function(modelId, scope) {
            this.modelId = modelId;
            this.nluModel = new NLUModel(modelId);

            this.tgtProps = {
                model: '',
                sys_scope: scope || gs.getCurrentApplicationId()
            };

            this.vocabPriIdsMap = {};
            this.intentPriIdsMap = {};
            this.intentIdsMap = {};
            this.entityPriIdsMap = {};
            this.entityIdsMap = {};
            this.utterancePriIdsMap = {};
        },

        /*
        	This will return the map of srcId -> tgtId.
        	priMap contains srcPriId -> tgtPriId,
			srcTgtMap contains srcId -> tgtId
        */
        createRecords: function(srcGr, priMap, getProps, srcTgtMap) {
            var srcPriMap = {}; // this is map of srcId -> srcPriId
            var thisObj = this;
            var srcTgtIdMap = NLUImportUtil.createRecords(srcGr, function(gr) {
                var primaryValue = NLUImportUtil.getPrimaryValue(gr);
                srcPriMap[gr.getUniqueValue()] = primaryValue;
                var newProps = NLUHelper.cloneDeep(thisObj.tgtProps);
                if (getProps) NLUHelper.extend(newProps, getProps(gr));
                if (priMap[primaryValue]) { //only primary mappings are needed to update primaryField here.
                    var primaryField = NLUImportUtil.FIELDS_DATA[gr.getTableName()].primaryField;
                    newProps[primaryField] = priMap[primaryValue];
                }
                return newProps;
            }, false);

            for (var srcId in srcTgtIdMap) {
                var srcPriId = srcPriMap[srcId];
                if (srcPriId && !(srcPriId in priMap)) {
                    priMap[srcPriId] = srcTgtIdMap[srcId]; // add entry for srcPriId -> tgtPriId
                }
            }
            if (srcTgtMap) NLUHelper.extend(srcTgtMap, srcTgtIdMap);
            return srcTgtIdMap;
        },

        getModelName: function(gr, newProps, isSecondary) {
            var displayName = (newProps.display_name ? newProps.display_name : this.getAUniqueName(gr.getValue('display_name')));
            if (!isSecondary) {
                return displayName;
            }
            return displayName + ' ' + NLUModel.getLanguage(gr).toUpperCase();
        },

        createModels: function(srcModelGr, newProps, isSecondary) {
            var thisObj = this;
            var modelIdsMap = NLUImportUtil.createRecords(srcModelGr, function() {
                return {
                    sys_scope: thisObj.tgtProps.sys_scope,
                    display_name: thisObj.getModelName(srcModelGr, newProps, isSecondary),
                    description: newProps.description,
                    primary_model: newProps.primary_model
                };
            });
            Object.keys(modelIdsMap).forEach(function(srcModelId) {
                var tgtModelId = modelIdsMap[srcModelId];
                NLUModel.updateModelStatus(tgtModelId, stateTypes.cloning);
            });
            return modelIdsMap;
        },

        createIntentEntities: function(getEntityProps, srcIntentIds) {
            var srcPriMap = {};
            var newEntityIdsMap = {};
            var thisObj = this;
            NLUIntent.forEachIntentEntityMap(srcIntentIds, function(srcIntentId, srcRelationship, srcEntityGr) {
                var primaryValue = NLUImportUtil.getPrimaryValue(srcEntityGr);
                srcPriMap[srcEntityGr.getUniqueValue()] = primaryValue;

                var entityId = srcEntityGr.getUniqueValue();
                // Create entity:
                var tgtEntityId = thisObj.entityIdsMap[entityId] || newEntityIdsMap[entityId];
                if (!tgtEntityId) {
                    tgtEntityId = NLUImportUtil.createRecord(tables.SYS_NLU_ENTITY, srcEntityGr, getEntityProps && getEntityProps(srcEntityGr), false);
                    newEntityIdsMap[entityId] = tgtEntityId;
                }
                // Create m2m record for intent-entity:
                new NLUIntent(thisObj.intentIdsMap[srcIntentId]).createIntentEntityMap(tgtEntityId, srcRelationship);
            });

            for (var srcId in newEntityIdsMap) {
                var srcPriId = srcPriMap[srcId];
                if (srcPriId && !(srcPriId in this.entityPriIdsMap)) {
                    this.entityPriIdsMap[srcPriId] = newEntityIdsMap[srcId]; // add entry for srcPriId -> tgtId
                }
            }
            return NLUHelper.extend(this.entityIdsMap, newEntityIdsMap);
        },

        createUtterances: function(srcUtteranceGr) {
            var thisObj = this;
            var utteranceIdsMap = this.createRecords(srcUtteranceGr, this.utterancePriIdsMap, function(gr) {
                return {
                    intent: thisObj.intentIdsMap[gr.intent],
                    sys_scope: thisObj.tgtProps.sys_scope
                };
            });

            var annotationGr = new GlideRecord(tables.M2M_SYS_NLU_UTTERANCE_ENTITY);
            annotationGr.addQuery('utterance', 'IN', Object.keys(utteranceIdsMap));
            annotationGr.query();
            NLUImportUtil.createRecords(annotationGr, function(gr) {
                return {
                    entity: thisObj.entityIdsMap[gr.entity],
                    utterance: utteranceIdsMap[gr.utterance],
                    annotation: gr.annotation,
                    sys_scope: thisObj.tgtProps.sys_scope
                };
            });
        },

        /*
        - filter is optional filter, which can be used to clone specific data from source model. 
        - format: 
        {
        	intents: ['intent1', 'intent2'],
        	entities: ['ent1', 'ent2'],
        	... 
        }
        */
        cloneModel: function(srcModelId, tgtModelId, filter) {
            this.tgtProps.model = tgtModelId;
            var thisObj = this;
            var nluModel = new NLUModel(srcModelId);
            var tgtModel = new NLUModel(tgtModelId);
            var isEntitiesEnabledInPrimary = NLUParloIntegrator.isEntitiesEnabled(this.tgtPriLanguage, tgtModel.getVersion());
            this.createRecords(nluModel.getVocabulary(), this.vocabPriIdsMap);
            this.createRecords(nluModel.getModelEntities(), isEntitiesEnabledInPrimary ? this.entityPriIdsMap : {}, null, this.entityIdsMap);

            // Skip if filter is provided and intents key exists, but it's null / empty array: 
            var skipIntents = filter && ('intents' in filter) && (!filter.intents || filter.intents.length == 0);
            if (!skipIntents) {
                this.createRecords(nluModel.getIntents(getIntentFilter(filter)), this.intentPriIdsMap, function(gr) {
                    var result = {};
                    if (gr.origin.nil() || NLUIntent.getGRById(gr.getValue('origin')) === null)
                        result.origin = gr.getUniqueValue();
                    
                    return result;
                }, this.intentIdsMap);
                var srcIntentIds = (filter && filter.intents) ? filter.intents : nluModel.getIntentIds();
                this.createIntentEntities(function(gr) {
                    var result = NLUHelper.cloneDeep(thisObj.tgtProps);
                    if (isEntitiesEnabledInPrimary && thisObj.entityPriIdsMap[NLUImportUtil.getPrimaryValue(gr)]) {
                        var primaryField = NLUImportUtil.FIELDS_DATA[gr.getTableName()].primaryField;
                        result[primaryField] = thisObj.entityPriIdsMap[NLUImportUtil.getPrimaryValue(gr)];
                    }
                    if (gr.model.nil() && result.model) delete result.model;
                    return result;
                }, srcIntentIds);
                this.createUtterances(nluModel.getUtterances(getUtteranceFilter(filter)));
            }
            NLUModel.updateModelStatus(tgtModelId, stateTypes.draft);

            // clone corresponding default test set from srcModelId to tgtModelId
            if (global.NLUSystemUtil.isNluAdvancedPluginActive() && typeof sn_nlu_workbench.NLUBatchTestSet.cloneTestSetForModel === 'function') {
                sn_nlu_workbench.NLUBatchTestSet.cloneTestSetForModel(srcModelId, tgtModelId);
            }
        },

        cloneGroupAsync: function(modelIdsMapStr, srcPriModelId, tgtPriModelId) {
            //clone primary model
            var modelIdsMap = JSON.parse(modelIdsMapStr);
            this.cloneModel(srcPriModelId, tgtPriModelId);
            this.tgtPriLanguage = new NLUModel(tgtPriModelId).getGR().getValue('language');
            // Clone secondary models:
            var srcModels = Object.keys(modelIdsMap);
            for (var i = 0, len = srcModels.length; i < len; i++) {
                var modelId = srcModels[i];
                this.cloneModel(modelId, modelIdsMap[modelId]);
            }
        },

        cloneGroup: function(opts) {
            var result = {};
            try {
                var srcPriModelGr = NLUModel.getModelsGr(this.modelId, [opts.model_props.language]);
                var obj = this.createModels(srcPriModelGr, opts.model_props);
                var srcPriModelId = Object.keys(obj)[0];
                var tgtPriModelId = obj[srcPriModelId];
                var srcSecModelsGr = NLUModel.getModelsGr(this.modelId, opts.secondary_languages);

                var modelIdsMap = this.createModels(srcSecModelsGr, {
                    primary_model: tgtPriModelId,
                    display_name: opts.model_props.display_name
                }, true);

                var tgtModels = Object.keys(modelIdsMap).map(function(srcModelId) {
                    return modelIdsMap[srcModelId];
                });
                tgtModels.push(tgtPriModelId);
                var script = "new NLUCloneModel('" + this.modelId + "', '" + this.tgtProps.sys_scope + "').cloneGroupAsync('" + JSON.stringify(modelIdsMap) + "', '" + srcPriModelId + "', '" + tgtPriModelId + "')";

                NLUWorkbenchGlobalScript.scheduleScript(script, tables.SYS_NLU_MODEL, this.modelId);

                result.sysIds = tgtModels;
                result.status = 'success';
                result.message = gs.getMessage('Creating copy of {0}', opts.model_props.display_name);

            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
            }

            return result;
        },

        cloneSingle: function(modelProps) {
            var result = {};
            if (!modelProps) modelProps = {};
            try {
                var srcPriModelGr = NLUModel.getModelsGr(this.modelId, modelProps.language ? [modelProps.language] : []);
                var obj = this.createModels(srcPriModelGr, modelProps);
                var srcPriModelId = Object.keys(obj)[0];
                var newModelId = obj[srcPriModelId];
                this.cloneModel(srcPriModelId, newModelId, modelProps.filter);
                result.sysId = newModelId;
                result.status = 'success';
                result.message = gs.getMessage('The model has been successfully copied.');
            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        clone: function(opts) {
            this.validateModel();
            if (opts.secondary_languages)
                return this.cloneGroup(opts);
            return this.cloneSingle(opts.model_props);
        },

        trimSuffixIfPresent: function(modelName) {
            var pos = modelName.search(constants.COPY_SUFFIX_REGEX);
            if (pos > -1) {
                return modelName.substring(0, pos);
            }
            if (modelName.length > 33) return modelName.substring(0, 33);
            return modelName;
        },

        getAUniqueName: function(modelName) {
            var name = this.trimSuffixIfPresent(modelName);
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery('display_name', 'LIKE', name + constants.COPY_NAME_SUFFIX + '%');
            gr.query();
            var sequence = 0;
            while (gr.next()) {
                var n = gr.display_name;
                if (constants.COPY_SUFFIX_REGEX.test(n)) {
                    var num = parseInt(n.match(constants.COPY_SUFFIX_REGEX)[2]);
                    if (num > sequence)
                        sequence = num;
                }
            }
            return this.getCloneModelName(name, sequence);
        },

        getCloneModelName: function(name, sequence) {
            var cloneModelName;
            sequence++;
            if (constants.COPY_SUFFIX_REGEX.test(name)) {
                cloneModelName = name.replace(constants.COPY_SUFFIX_REGEX, function(match, p1) {
                    return p1 + sequence;
                });
            } else {
                cloneModelName = name + constants.COPY_NAME_SUFFIX + sequence;
            }
            return (cloneModelName.length <= constants.MODEL_NAME_LENGTH ? cloneModelName : this.trimModelName(cloneModelName));
        },

        trimModelName: function(modelName) {
            var trimLength = modelName.length - constants.MODEL_NAME_LENGTH;
            var pos = modelName.search(constants.COPY_SUFFIX_REGEX);
            if (trimLength > 0) {
                var name = modelName.substring(0, pos - trimLength) + modelName.substring(pos);
                var gr = new GlideRecord(tables.SYS_NLU_MODEL);
                if (gr.get('display_name', modelName)) {
                    return this.getAUniqueName(name);
                }
                return name;
            }
            return modelName;
        },

        copySysEntityState: function(targetModelId) {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY);
            gr.addQuery('model', targetModelId);
            var jq = gr.addJoinQuery(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY, 'sys_entity', 'sys_entity');
            jq.addCondition('model', this.modelId);
            jq.addCondition('active', false);
            gr.query();
            while (gr.next()) {
                gr.setValue('active', false);
                gr.update();
            }
        },

        copyVocabulary: function(targetModelId) {
            var fields = ['name', 'type', 'pattern', 'related_terms', 'model'];
            var gr = (new NLUModel(this.modelId)).getVocabulary();
            while (gr.next()) {
                gr.setValue('model', targetModelId);
                NLUSystemUtil.copyRecordFromGR('sys_nlu_vocabulary', fields, gr);
            }
        },

        validateModel: function() {
            var modelGr = this.nluModel.getGR();
            if (modelGr.getValue('category') === 'virtual_agent' && !global.NLUModelCategoryUtil.isVAEnabled()) throw new Error(gs.getMessage("Install Glide Virtual Agent plugin to enable cloning virtual agent models."));
            
	    var grAccessCheck = GlideRecord(tables.SYS_NLU_MODEL);
            if (!grAccessCheck.canWrite()) {
                throw new Error(gs.getMessage('User not authorized to import data to model'));
            }
        }

    };
})();
