var NLUMappingsProcessor = Class.create();

(function() {

    var tables = NLUConstants.tables;

    NLUMappingsProcessor.getNameField = function(table) {
        return table === tables.SYS_NLU_MODEL ? 'display_name' : 'name';
    };

    NLUMappingsProcessor.getPrimary = function(sysId, mappings) {
        for (var i in mappings) {
            var eachMapping = mappings[i];
            if (eachMapping.secondary.indexOf(sysId) !== -1) return eachMapping.primary;
        }
        return null;
    };

    NLUMappingsProcessor.unlinkPrimary = function(gr) {
        var table = gr.getTableName();
        var primaryField = NLUImportUtil.FIELDS_DATA[table].primaryField;
        while (gr.next()) {
            gr.setValue(primaryField, '');
            gr.update();
        }
    };

    NLUMappingsProcessor.getAllModels = function(modelIds) {
        var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        modelGr.addQuery('sys_id', 'IN', modelIds.join());
        modelGr.query();
        return modelGr;
    };

    NLUMappingsProcessor.getAllIntents = function(modelIds) {
        var intentGr = new GlideRecord(tables.SYS_NLU_INTENT);
        intentGr.addQuery('model', 'IN', modelIds.join());
        intentGr.query();
        return intentGr;
    };

    NLUMappingsProcessor.getAllEntities = function(modelIds) {
        var entityGr = new GlideRecord(tables.SYS_NLU_ENTITY);
        var joinQuery = entityGr.addJoinQuery(tables.M2M_SYS_NLU_INTENT_ENTITY, 'sys_id', 'entity');
        joinQuery.addCondition('intent.model', 'IN', modelIds.join());
        entityGr.addEncodedQuery('^NQmodel.sys_idIN' + modelIds.join());
        entityGr.query();
        return entityGr;
    };

    NLUMappingsProcessor.prototype = {

        initialize: function() {
            this.primaryIdNameMap = {};
        },

        saveMappings: function(mappings) {

            this.processPrimaryModel(mappings.models.primary);
            this.checkRemovedModels(mappings.models);

            var secondaryModels = mappings.models.secondary;
            this.processSecondary(NLUMappingsProcessor.getAllModels(secondaryModels), [mappings.models]);

            if (mappings.intents) {
                var secIntentsGr = NLUMappingsProcessor.getAllIntents(secondaryModels);
                var unmappedPrimaryIds = this.processSecondary(secIntentsGr, mappings.intents);
                var context = this;
                var primaryField = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_INTENT].primaryField;
                unmappedPrimaryIds.forEach(function(priIntentId) {
                    var intentName = context.primaryIdNameMap[tables.SYS_NLU_INTENT][priIntentId];
                    secondaryModels.forEach(function(secModelId) {
                        var secIntentGr = new NLUModel(secModelId).getIntents('name=' + intentName);
                        if (!secIntentGr.next()) {
                            var newIntentGr = new GlideRecord(tables.SYS_NLU_INTENT);
                            newIntentGr.initialize();
                            newIntentGr.setValue('model', secModelId);
                            newIntentGr.setValue(primaryField, priIntentId);
                            context.updateName(newIntentGr, priIntentId);
                            newIntentGr.insert();
                        }
                    });
                });
            }

            if (mappings.entities)
                this.processSecondary(NLUMappingsProcessor.getAllEntities(secondaryModels), mappings.entities);
        },

        checkRemovedModels: function(modelMapping) {
            var primaryField = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].primaryField;
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery(primaryField, modelMapping.primary);
            gr.query();
            var modelIds = [];
            while (gr.next()) {
                var modelId = gr.getUniqueValue();
                if (modelMapping.secondary.indexOf(modelId) === -1) {
                    modelIds.add(modelId);
                    gr.setValue(primaryField, '');
                    gr.update();
                }
            }
            if (modelIds.length > 0) {
                NLUMappingsProcessor.unlinkPrimary(NLUMappingsProcessor.getAllIntents(modelIds));
                NLUMappingsProcessor.unlinkPrimary(NLUMappingsProcessor.getAllEntities(modelIds));
            }
        },

        processPrimaryModel: function(modelId) {
            var nluModel = new NLUModel(modelId);
            var gr = nluModel.getGR();
            if (gr.get(modelId)) {
                this.updatePrimary(gr);
                var intentGr = nluModel.getIntents();
                while (intentGr.next()) {
                    // Enable all primary intents
                    intentGr.setValue('enable', true);
                    if (!this.updatePrimary(intentGr)) {
                        intentGr.update();
                    }
                }

                var entityGr = nluModel.getEntities();
                while (entityGr.next()) this.updatePrimary(entityGr);
            } else {
                throw new Error(gs.getMessage('Model {0} does not exists!', modelId));
            }
        },

        updatePrimary: function(gr) {
            var table = gr.getTableName();

            if (!this.primaryIdNameMap[table]) this.primaryIdNameMap[table] = {};
            var nameField = NLUMappingsProcessor.getNameField(table);
            this.primaryIdNameMap[table][gr.getUniqueValue()] = gr.getValue(nameField);

            var primaryField = NLUImportUtil.FIELDS_DATA[table].primaryField;
            if (gr.getValue(primaryField)) {
                gr.setValue(primaryField, '');
                return gr.update();
            }
            return null;
        },

        processSecondary: function(gr, mappings) {
            var table = gr.getTableName();
            var unmappedPrimaryIds = Object.keys(this.primaryIdNameMap[table]);
            var primaryField = NLUImportUtil.FIELDS_DATA[table].primaryField;
            while (gr.next()) {
                var oldPrimaryId = gr.getValue(primaryField);
                var newPrimaryId = NLUMappingsProcessor.getPrimary(gr.getUniqueValue(), mappings);
                if (newPrimaryId) {
                    if (newPrimaryId !== oldPrimaryId) gr.setValue(primaryField, newPrimaryId);
                    this.updateName(gr, newPrimaryId);
                    gr.update();
                    var mappedEntryIndex = unmappedPrimaryIds.indexOf(newPrimaryId);
                    if (mappedEntryIndex !== -1) unmappedPrimaryIds.splice(mappedEntryIndex, 1);
                } else if (oldPrimaryId) {
                    // User removed the mapping:
                    gr.setValue(primaryField, '');
                    gr.update();
                }
            }

            // These are the primary ids, which do not have any mapping:
            return unmappedPrimaryIds;
        },

        updateName: function(gr, newPrimaryId) {
            var table = gr.getTableName();
            var nameField = NLUMappingsProcessor.getNameField(table);
            var newName = this.primaryIdNameMap[table][newPrimaryId];
            if (table === tables.SYS_NLU_MODEL) newName = newName + ' ' + NLUModel.getLanguage(gr).toUpperCase();
            if (newName) gr.setValue(nameField, newName);
        },

        type: 'NLUMappingsProcessor'
    };

})();
