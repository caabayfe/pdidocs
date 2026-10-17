var NLUModelExporter = Class.create();
(function() {
    var tables = NLUConstants.tables;
    NLUModelExporter.prototype = {
        initialize: function() {
            this.tracker = SNC.GlideExecutionTracker.getLastRunning();
            this.updateManager = new GlideUpdateManager2();
            this.solutionExporter = new SolutionExporter(this.tracker, this.updateManager);
        },

        exportModel: function(modelGr) {
            var modelId = modelGr.getUniqueValue();

            this.tracker.setMaxProgressValue(this.getTotalRowCount(modelId));
            this.tracker.run();

            if (modelGr == null || !modelGr.isValidRecord()) {
                this.tracker.fail(gs.getMessage('Invalid model record'));
                return;
            }
            try {
                this.nluModel = new NLUModel(modelId);

                solution = new NLUParloIntegrator(modelGr).getSolution();
                if (!this.addSolutionRecords(solution.getName(), 3))
                    return;

                var lookupGr = this.nluModel.getLookups();
                while (lookupGr.next()) {
                    this.solutionExporter.saveRecord(lookupGr);
                    if (!this.addSolutionRecords(lookupGr.getValue('solution_name'), 1))
                        return;
                }

                this.solutionExporter.saveRecord(modelGr);
                this.tracker.updateMessage(gs.getMessage('Adding model records'));

                this.addRecords(this.nluModel.getIntents());
                this.addRecords(this.nluModel.getUtterances());
                this.addRecords(this.nluModel.getEntities());
                this.addRecords(this.nluModel.getVocabulary());
                this.addRecords(this.nluModel.getDefaultTestsetGR());
                this.addRecords(this.nluModel.getDefaultTestsetUtterancesGR());
                
                this.solutionExporter.addRelatedRecords(tables.M2M_SYS_NLU_INTENT_ENTITY, NLUModel.getReferenceTableKey(tables.M2M_SYS_NLU_INTENT_ENTITY), modelId);
                this.solutionExporter.addRelatedRecords(tables.M2M_SYS_NLU_UTTERANCE_ENTITY, NLUModel.getReferenceTableKey(tables.M2M_SYS_NLU_UTTERANCE_ENTITY), modelId);
                this.solutionExporter.addRelatedRecords(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY, NLUModel.getReferenceTableKey(tables.M2M_SYS_NLU_MODEL_SYS_ENTITY), modelId);

                this.tracker.success();
            } catch (error) {
                this.tracker.fail(error.message);
            }
        },

        addSolutionRecords: function(solutionName, maxCount) {
            var gr = new GlideRecord(tables.ML_CAPABILITY_DEFINITION_BASE);
            gr.addQuery('solution_name', solutionName);
            gr.query();
            if (gr.next()) {
                return this.solutionExporter.exportSolutionDefinitionInit(gr, maxCount);
            } else {
                throw new Error(gs.getMessage("Solution definition doesn't exisit for {0}", solutionName));
            }
        },

        getTotalRowCount: function(modelId) {
            // Count model record
            var count = 1;
            //var tables = ['intent', 'entity', 'vocabulary', 'utterance', 'm2m_sys_nlu_intent_entity', 'm2m_sys_nlu_utterance_entity']

            // Add all model related records from above tables
            count += this.solutionExporter.getRelatedRecords(tables.SYS_NLU_INTENT, 'model', modelId).getRowCount();
            count += this.solutionExporter.getRelatedRecords(tables.SYS_NLU_ENTITY, 'model', modelId).getRowCount();
            count += this.solutionExporter.getRelatedRecords(tables.SYS_NLU_VOCABULARY, 'model', modelId).getRowCount();
            count += this.solutionExporter.getRelatedRecords(tables.SYS_NLU_UTTERANCE, 'intent.model', modelId).getRowCount();
            count += this.solutionExporter.getRelatedRecords(tables.M2M_SYS_NLU_INTENT_ENTITY, 'intent.model', modelId).getRowCount();
            count += this.solutionExporter.getRelatedRecords(tables.M2M_SYS_NLU_UTTERANCE_ENTITY, 'utterance.intent.model', modelId).getRowCount();
            count += 20;
            return count;
        },

        addRecords: function(gr) {
            while (gr.next()) {
                this.solutionExporter.saveRecord(gr);
            }
        },

        type: 'NLUModelExporter'
    };
})();
