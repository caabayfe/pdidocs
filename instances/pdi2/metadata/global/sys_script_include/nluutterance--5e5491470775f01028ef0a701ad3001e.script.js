var NLUUtterance = Class.create();

(function() {

    var tables = NLUConstants.tables;
    var FIELDS = {
        UTTERANCE: 'utterance',
        INTENT: 'intent'
    };

    NLUUtterance.getRecordBySysId = function(sysId) {
        var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
        return gr.get(sysId) && gr;
    };

    NLUUtterance.getUtteranceByName = function(utterance, filter) {
        var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
        gr.addQuery(FIELDS.UTTERANCE, utterance);
        if (filter) gr.addEncodedQuery(filter);
        gr.query();
        return gr;
    };

    // Pass modelId, just to avoid delete accorss the models
    NLUUtterance.deleteRecords = function(modelId, filter) {
        if (modelId && filter) {
            var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
            gr.addQuery('intent.model', modelId);
            gr.addEncodedQuery(filter);
            gr.deleteMultiple();
        }
    };

    NLUUtterance.addRecord = function(utterance, intentId) {
        var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
        gr.newRecord();
        gr.setValue(FIELDS.UTTERANCE, utterance);
        gr.setValue(FIELDS.INTENT, intentId);
        return gr.insert();
    };

    NLUUtterance.getAssociatedEntities = function(utteranceIds) {
        if (!utteranceIds || !Array.isArray(utteranceIds) || utteranceIds.length === 0)
            return [];

        var entitiesIds = [];
        var uttrEntityGr = new GlideRecord(tables.M2M_SYS_NLU_UTTERANCE_ENTITY);
        uttrEntityGr.addQuery('utterance', 'IN', utteranceIds.join(','));
        uttrEntityGr.query();
        while (uttrEntityGr.next())
            entitiesIds.push(uttrEntityGr.getValue('entity'));

        return entitiesIds;
    };

    /**
     * Method that takes care of moving utterances to another intent, clean entities based on usage
     * @param {string} srcIntentId Intent ID from which utterances are moved
     * @param {string} targetIntentId Intent sys_id to which utterances are moved
     * @param {Array[string]} utteranceIds sys_id's of all utterances to be moved
     * @param {Array[string]} entityIds sys_id's of all entities that the moving utterances use
     */
    NLUUtterance.moveUtterancesToIntent = function(srcIntentId, targetIntentId, utteranceIds) {
        var movedEntityIds = [];
        var entitiesToMove = [];
        var entitiesToCopy = [];
        var entitiesToDelete = [];

        try {
            // 1. Update utterance.intent to targetIntentId
            NLUSystemUtil.updateRecords(
                tables.SYS_NLU_UTTERANCE,
                "sys_idIN" + utteranceIds.join(','), {
                    intent: targetIntentId
                }
            );

            var srcNluIntent = new NLUIntent(srcIntentId);
            var tgtNluIntent = new NLUIntent(targetIntentId);

            var srcEntityIds = NLUUtterance.getAssociatedEntities(utteranceIds);
            // 2. Clean up entities
            if (srcEntityIds) {
                var srcEntitiesInUseMap = NLUSystemUtil.getGroupByCount(
                    tables.M2M_SYS_NLU_UTTERANCE_ENTITY,
                    'entity',
                    'entityIN' + srcEntityIds.join(',') + '^utterance.intent=' + srcIntentId + '^utteranceNOTIN' + utteranceIds.join(',')
                );

                var entitiesUsedInTgtIntentMap = NLUSystemUtil.getGroupByCount(
                    tables.M2M_SYS_NLU_INTENT_ENTITY,
                    'entity',
                    'intent=' + targetIntentId + '^entityIN' + srcEntityIds.join(',')
                );

                srcEntityIds.forEach(function(entityId) {
                    if (!srcEntitiesInUseMap[entityId]) srcEntitiesInUseMap[entityId] = 0;
                    if (!entitiesUsedInTgtIntentMap[entityId]) entitiesUsedInTgtIntentMap[entityId] = 0;

                    if (srcEntitiesInUseMap[entityId] === 0 && entitiesUsedInTgtIntentMap[entityId] === 0) {
                        // move intent entity record: mark it to change the src-intent-entity record's intent id to target-intent-id
                        entitiesToMove.push(entityId);
                    } else if (srcEntitiesInUseMap[entityId] > 0 && entitiesUsedInTgtIntentMap[entityId] === 0) {
                        // create new intent-entity record for trgt-intent
                        entitiesToCopy.push(entityId);
                    } else if (srcEntitiesInUseMap[entityId] === 0 && entitiesUsedInTgtIntentMap[entityId] > 0) {
                        // mark for delete
                        entitiesToDelete.push(entityId);
                    }
                });

                // 3. move intent-entites
                if (entitiesToMove.length > 0) {
                    NLUSystemUtil.updateRecords(
                        tables.M2M_SYS_NLU_INTENT_ENTITY,
                        "entityIN" + entitiesToMove.join(',') + "^intent=" + srcIntentId, {
                            intent: targetIntentId
                        }
                    );
                    movedEntityIds = movedEntityIds.concat(entitiesToMove);
                }

                // 4. create intent-entities
                if (entitiesToCopy.length > 0) {
                    var entityData = NLUEntity.getEntityData(entitiesToCopy, 'intent=' + srcIntentId);
                    entityData.forEach(function(eachEntity) {
                        var entityIndex = entitiesToCopy.indexOf(eachEntity.id);
                        if (entityIndex > -1) {
                            tgtNluIntent.createIntentEntityMap(eachEntity.id, eachEntity.relationship);
                            entitiesToCopy.splice(entityIndex, 1);
                        }
                    });
                }

                // 5. delete intent-entities
                if (entitiesToDelete.length > 0) {
                    srcNluIntent.deleteIntentEntities('entityIN' + entitiesToDelete.join(','));
                    movedEntityIds = movedEntityIds.concat(entitiesToDelete);
                }

                return {
                    status: 'success',
                    movedEntityIds: movedEntityIds
                };
            }

            return {
                status: 'success',
                movedEntityIds: null
            };


        } catch (error) {
            return {
                status: 'failure',
                movedEntityIds: null
            };
        }

    };

    NLUUtterance.prototype = {

        initialize: function(utteranceId, utteranceGr) {
            this.sysId = utteranceId;
            if (utteranceGr) {
                this.gr = utteranceGr;
                this.sysId = this.gr.getUniqueValue();
            }
        },

        getGr: function() {
            if (!this.gr) this.gr = NLUUtterance.getRecordBySysId(this.sysId);
            return this.gr;
        },

        updateIntent: function(intentId) {
            var gr = this.getGr();
            gr.setValue(FIELDS.INTENT, intentId);
            return gr.update();
        },

        deleteRecord: function() {
            var gr = this.getGr();
            return gr && gr.deleteRecord();
        },

        type: 'NLUUtterance'
    };
})();
