var NLUImportUtil = Class.create();

(function() {

    var tables = NLUConstants.tables;
    var entityType = NLUConstants.ENTITY_TYPES;
    var entityPropsToCompare = ['name', 'type', 'lookup', 'field_name', 'values_list'];

    var _getParent = function(entityGr) {
        return entityGr.getValue('parent') || entityGr.base_entity.name.toString();
    };

    NLUImportUtil.FIELDS_DATA = {};

    NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL] = {
        copyFields: ['sys_scope', 'display_name', 'category', 'confidence_threshold', 'threshold_type', 'language', 'model_domain'],
        translatableFields: ['description'],
        primaryField: 'primary_model',
    };

    NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_VOCABULARY] = {
        copyFields: ['sys_scope', 'type', 'pattern'],
        translatableFields: ['name', 'related_terms'],
        primaryField: 'primary_vocabulary',
    };

    NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_ENTITY] = {
        copyFields: ['sys_scope', 'name', 'type', 'parent', 'table', 'field_name', 'lookup', 'confidence_threshold', 'override_confidence_threshold', 'values_list'],
        translatableFields: ['values_list'], // Only incase type == 'mapped' && lookup == null
        primaryField: 'primary_entity',
    };

    NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_INTENT] = {
        copyFields: ['sys_scope', 'name', 'origin', 'confidence_threshold', 'override_confidence_threshold', 'enable'],
        translatableFields: ['description'],
        primaryField: 'primary_intent',

    };

    NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_UTTERANCE] = {
        copyFields: ['utterance', 'sys_scope'],
        translatableFields: ['utterance'],
        primaryField: 'primary_utterance',
    };

    NLUImportUtil.getPrimaryValue = function(gr) {
        var primaryField = NLUImportUtil.FIELDS_DATA[gr.getTableName()].primaryField;
        return gr.getValue(primaryField) || gr.getUniqueValue();
    };

    NLUImportUtil.createRecords = function(gr, getProps, disableBr) {
        var map = {};
        var tableName = gr.getTableName();
        while (gr.next()) {
            map[gr.getUniqueValue()] = NLUImportUtil.createRecord(tableName, gr, getProps && getProps(gr), false, disableBr);
        }
        return map;
    };

    NLUImportUtil.createRecord = function(table, srcGr, newProps, isTranslate, disableBr) {
        if (!newProps) newProps = {};
        var primaryField = NLUImportUtil.FIELDS_DATA[table].primaryField;
        if (isTranslate && NLUImportUtil.FIELDS_DATA.hasOwnProperty(table)) {
            newProps[primaryField] = srcGr.getUniqueValue();
        }
        return NLUSystemUtil.copyRecordFromGR(table, NLUImportUtil.getFields(table, isTranslate), srcGr, newProps, disableBr);
    };

    NLUImportUtil.getFields = function(table, isTranslate) {
        if (NLUImportUtil.FIELDS_DATA.hasOwnProperty(table)) {
            var result = NLUImportUtil.FIELDS_DATA[table].copyFields;
            if (!isTranslate && NLUImportUtil.FIELDS_DATA[table].translatableFields)
                result = result.concat(NLUImportUtil.FIELDS_DATA[table].translatableFields);
            return result;
        }
        return [];
    };


    /*
    {
        <intentId>: [
            {
                utterance: <utterance>
                annotations: [
                    {
                        entityName: <entityName>
                        annotation: <annotation>
                    },
                ]
            },
        ],

    }
    */
    NLUImportUtil._getIntentUtteranceMap = function(intentIds) {
        var utteranceIds = [];
        var utteranceMap = {};
        var intentUtteranceMap = {};

        var utteranceGR = new GlideRecord(tables.SYS_NLU_UTTERANCE);
        utteranceGR.addQuery('intent', 'IN', intentIds);
        utteranceGR.query();
        while (utteranceGR.next()) {
            var utteranceId = utteranceGR.getUniqueValue();
            var intentId = utteranceGR.getValue('intent');
            var uttObj = {
                annotations: [],
                utterance: utteranceGR.getValue('utterance'),
                utteranceId: utteranceId
            };

            if (!intentUtteranceMap[intentId]) intentUtteranceMap[intentId] = [];
            intentUtteranceMap[intentId].push(uttObj);

            utteranceMap[utteranceId] = uttObj;
            utteranceIds.push(utteranceId);
        }
        NLUImportUtil._addAnnotations(utteranceIds, utteranceMap);
        return intentUtteranceMap;
    };

    NLUImportUtil._addAnnotations = function(utteranceIds, utteranceMap) {
        var annotationGr = new GlideRecord(tables.M2M_SYS_NLU_UTTERANCE_ENTITY);
        annotationGr.addQuery('utterance', 'IN', utteranceIds);
        annotationGr.query();
        while (annotationGr.next()) {
            var utteranceId = annotationGr.getValue('utterance');
            var uttObj = utteranceMap[utteranceId];
            uttObj.annotations.push({
                entityName: annotationGr.entity.name.toString(),
                annotation: annotationGr.getValue('annotation')
            });
        }
    };

    NLUImportUtil.importIntent = function(intents, modelId, isTranslate) {
        var importUtil = new NLUImportUtil(modelId, isTranslate);
        return importUtil.importIntents(intents);
    };

    NLUImportUtil.isSystemEntitySupported = function(sysEntities, entityType) {
        for (var i = 0; i < sysEntities.length; i++) {
            if (sysEntities[i].name == entityType) {
                return true;
            }
        }
        return false;
    };

    NLUImportUtil.prototype = {

        initialize: function(tgtModelId, isTranslate) {
            this.tgtModelId = tgtModelId;
            this.tgtNluModel = new NLUModel(this.tgtModelId);
            this.tgtProps = {
                model: this.tgtModelId,
                sys_scope: this.tgtNluModel.getScope()
            };
            this.isTranslate = isTranslate;
            this.allEntitiesData = null;
        },

        importEntities: function(srcEntities) {
            var result = {};
            try {
                this.importEntitiesFromGr(NLUEntity.getEntitiesGr(srcEntities));

                result.status = 'success';
                result.message = gs.getMessage('Import Successful');
            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        importIntents: function(srcIntents, entityMap) {
            return this.importIntentsFromGr(NLUIntent.getIntentsGr(srcIntents), entityMap);
        },

        importEntitiesFromGr: function(srcEntityGr) {
            this.tgtNluModel.setDirty();
            return this.createModelEntities(srcEntityGr, this.tgtProps);
        },

        importIntentsFromGr: function(srcIntentGr, entityMap) {
            var result = {};
            try {
                var intentIdsMap = this.createIntents(srcIntentGr, this.tgtProps);
                this.tgtProps.sysEntities = this.tgtNluModel.getSystemEntities();
                entityMap = this.createIntentEntities(intentIdsMap, this.tgtProps, entityMap);
                this.createUtterances(intentIdsMap, entityMap, this.tgtProps.sys_scope);
                this.tgtNluModel.setDirty();
                result.status = 'success';
                result.message = gs.getMessage('Import Successful');
            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        createRecord: function(table, srcGr, newProps) {
            return NLUImportUtil.createRecord(table, srcGr, newProps, this.isTranslate);
        },

        createIntents: function(srcIntentGr, newProps) {
            var intentIdsMap = {};
            while (srcIntentGr.next()) {
                var oldIntentId = srcIntentGr.getUniqueValue();
                if ((srcIntentGr.origin.nil() || NLUIntent.getGRById(srcIntentGr.getValue('origin')) === null) && !this.isTranslate)
                    newProps.origin = oldIntentId;
                if (srcIntentGr.getValue('enable') === null)
                    newProps.enable = true;
                var intentGr = this.tgtNluModel.getIntents('name=' + srcIntentGr.name);
                if (intentGr.next()) intentIdsMap[oldIntentId] = intentGr.getUniqueValue();
                else intentIdsMap[oldIntentId] = this.createRecord(tables.SYS_NLU_INTENT, srcIntentGr, newProps);
            }
            return intentIdsMap;
        },

        createModelEntities: function(entitiesGr, newProps) {
            var entityMap = {};
            while (entitiesGr.next()) {
                if (entitiesGr.getValue('type') == entityType.system_derived &&
                    typeof newProps.sysEntities != 'undefined' &&
                    !NLUImportUtil.isSystemEntitySupported(newProps.sysEntities, entitiesGr.parent)) {
                    continue;
                }
                var tgtEntityId = !this.isTranslate && this.getEntityWithSameProps(entitiesGr, newProps);
                if (!tgtEntityId)
                    tgtEntityId = this.createRecord(tables.SYS_NLU_ENTITY, entitiesGr, newProps);
                entityMap[entitiesGr.getValue('name')] = tgtEntityId;
            }
            return entityMap;
        },

        createIntentEntities: function(intentIdsMap, entityProps, entityMap) {
            if (!entityMap) entityMap = {};
            var thisObj = this;
            NLUIntent.forEachIntentEntityMap(Object.keys(intentIdsMap), function(srcIntentId, srcRelationship, srcEntityGr) {
                if (srcEntityGr.getValue('type') == entityType.system_derived &&
                    typeof entityProps.sysEntities != 'undefined' &&
                    !NLUImportUtil.isSystemEntitySupported(entityProps.sysEntities, srcEntityGr.parent)) {
                    return;
                }
                var entityName = srcEntityGr.getValue('name');
                // Create entity:
                var tgtEntityId = entityMap[entityName];
                if (!tgtEntityId) {
                    var newProps = NLUHelper.cloneDeep(entityProps);
                    if (srcEntityGr.model.nil() && newProps.model) delete newProps.model;

                    tgtEntityId = !thisObj.isTranslate && thisObj.getEntityWithSameProps(srcEntityGr, newProps);
                    // Check if entity with same name & properties exists:
                    if (!tgtEntityId)
                        tgtEntityId = thisObj.createRecord(tables.SYS_NLU_ENTITY, srcEntityGr, newProps);
                }

                // Create m2m record for intent-entity:
                if (tgtEntityId) {
                    entityMap[entityName] = tgtEntityId;
                    new NLUIntent(intentIdsMap[srcIntentId]).createIntentEntityMap(tgtEntityId, srcRelationship);
                }
            });
            return entityMap;
        },

        createUtterances: function(intentIdsMap, entityMap, sysScope) {
            var intentUtteranceMap = NLUImportUtil._getIntentUtteranceMap(Object.keys(intentIdsMap));
            for (var oldIntentId in intentUtteranceMap) {
                var utterances = intentUtteranceMap[oldIntentId];
                utterances && utterances.forEach(function(utterance) {
                    var utteranceId = NLUSystemUtil.copyRecord(tables.SYS_NLU_UTTERANCE,
                        ['utterance', 'intent', 'sys_scope'], {
                            utterance: utterance.utterance,
                            intent: intentIdsMap[oldIntentId],
                            sys_scope: sysScope,
                        });

                    if (utteranceId) {
                        utterance.annotations.forEach(function(annotationData) {
                            if (entityMap[annotationData.entityName]) {
                                NLUSystemUtil.copyRecord(tables.M2M_SYS_NLU_UTTERANCE_ENTITY,
                                    ['utterance', 'entity', 'annotation', 'sys_scope'], {
                                        utterance: utteranceId,
                                        entity: entityMap[annotationData.entityName],
                                        annotation: annotationData.annotation,
                                        sys_scope: sysScope
                                    });
                            }
                        });
                    }
                });
            }
        },

        getEntityWithSameProps: function(srcEntityGr, newProps) {
            if (!newProps) newProps = {};

            if (!this.allEntitiesData)
                this.populateAllEntitiesData();

            for (var i = 0; i < this.allEntitiesData.length; i++) {
                var matchFound = false;
                var eachEntity = this.allEntitiesData[i];

                // Check if parent / base_entity is same: 
                var srcParent = _getParent(srcEntityGr);
                if (eachEntity['parent'] === srcParent) {
                    // Add filter for rest all fields:
                    matchFound = true;
                    for (var j = 0; j < entityPropsToCompare.length; j++) {
                        var prop = entityPropsToCompare[j];
                        var srcVal = newProps[prop] || srcEntityGr.getValue(prop);
                        if (eachEntity[prop] !== srcVal) {
                            matchFound = false;
                            break;
                        }
                    }
                }
                if (matchFound)
                    return eachEntity.id;
            }
            return null;
        },

        populateAllEntitiesData: function() {
            this.allEntitiesData = [];
            var entityGr = this.tgtNluModel.getEntities();
            while (entityGr.next()) {
                var parent = _getParent(entityGr);
                var entityData = {
                    id: entityGr.getUniqueValue(),
                    model: entityGr.getValue('model'),
                    parent: parent
                };
                entityPropsToCompare.forEach(function(prop) {
                    entityData[prop] = entityGr.getValue(prop);
                });
                this.allEntitiesData.push(entityData);
            }
        },

        type: 'NLUImportUtil'
    };
})();
