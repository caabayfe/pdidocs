var NLUEntity = Class.create();

(function() {

    var constants = global.NLUConstants.constants;
    var tables = global.NLUConstants.tables;

    NLUEntity.getGRById = function(entityId) {
        var gr = new GlideRecord(tables.SYS_NLU_ENTITY);
        gr.get(entityId);

        return gr;
    };

    NLUEntity.getEntitiesGr = function(entities) {
        var entityGr = new GlideRecord(tables.SYS_NLU_ENTITY);
        entityGr.addQuery('sys_id', 'IN', entities);
        entityGr.query();
        return entityGr;
    };

    NLUEntity.getDataFromGR = function(entityRec) {
        var entityArray = [];

        while (entityRec.next()) {
            entityArray.push({
                id: entityRec.getValue('sys_id'),
                name: entityRec.getValue('name'),
                createdOnTimestamp: global.NLUHelper.toTimezoneAdjustedTimestamp(
                    new GlideDateTime(entityRec.getValue('sys_created_on'))),
            });
        }

        return entityArray;
    };

    NLUEntity.getSysEntityByName = function(name) {
        var gr = new GlideRecord(tables.SYS_NLU_SYS_ENTITY);
        if (gr.get('name', name)) return gr;

        return null;
    };

    NLUEntity.isModelAssignedToMe = function(sysId, modelId) {
        if (!modelId) {
            var intEntGr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
            intEntGr.addQuery('entity', sysId);
            intEntGr.query();
            if (intEntGr.next()) {
                modelId = intEntGr.intent.model;
            }
        }
        return global.NLUModel.isAssignedToMe(modelId);
    };

    NLUEntity.getEntityData = function(entityIds, filter) {
        var entityData = [];
        var srcIntentEntitiesGr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
        var query = 'entityIN' + entityIds.join(',') + (filter ? '^' + filter : '');
        srcIntentEntitiesGr.addEncodedQuery(query);
        srcIntentEntitiesGr.query();

        while (srcIntentEntitiesGr.next()) {
            var entityId = srcIntentEntitiesGr.getValue('entity');
            entityData.push({
                id: entityId,
                intent: srcIntentEntitiesGr.getValue('intent'),
                relationship: srcIntentEntitiesGr.getValue('relationship')
            });
        }
        return entityData;
    };


    NLUEntity.prototype = {

        type: 'NLUEntity',

        initialize: function(entityId) {
            this.entityId = entityId;
        },

        getGR: function() {
            if (!this.entityGr) this.entityGr = NLUEntity.getGRById(this.entityId);
            return this.entityGr;
        },

        getAnnotations: function(intentId, filter) {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_UTTERANCE_ENTITY);
            gr.addQuery('entity', this.entityId);
            if (intentId) {
                var joinQuery = gr.addJoinQuery(tables.SYS_NLU_UTTERANCE, 'utterance', 'sys_id');
                joinQuery.addCondition('intent', intentId);
            }
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getModelId: function() {
            var modelId = this.getGR().getValue('model');
            if (!modelId) {
                var m2mGr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
                if (m2mGr.get('entity', this.getGR().getUniqueValue())) {
                    modelId = m2mGr.intent.model;
                }
            }
            return modelId;
        }
    };

})();
