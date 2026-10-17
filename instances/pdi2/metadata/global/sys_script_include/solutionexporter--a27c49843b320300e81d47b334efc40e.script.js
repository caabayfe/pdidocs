var SolutionExporter = Class.create();
SolutionExporter.prototype = {
    CAPABILITY_NLU: 'nlu_trainer',
    UPDATESET_MAX_PAYLOAD_SIZE_BYTES: '12582912',
    initialize: function(tracker, updateManager) {
        this.tracker = tracker || SNC.GlideExecutionTracker.getLastRunning();
        this.updateManager = updateManager || new GlideUpdateManager2();
    },

    exportSolutionDefinitionInit: function(capabilityDefiniton, maxCount) {
        if (this.tracker.getProgressValue == 0) {
            this.tracker.setMaxProgressValue(this.getTotalRowCount(capabilityDefiniton.getUniqueValue()));
            this.tracker.run();
        } else {
            this.tracker.updateProgressValue(this.tracker.getProgressValue + this.getTotalRowCount(capabilityDefiniton.getUniqueValue()));
        }

        if (capabilityDefiniton == null || !capabilityDefiniton.isValidRecord()) {
            this.tracker.fail(gs.getMessage('Invalid solution definition'));
            return false;
        }

        if (this.checkForDefaultUpdateSet(capabilityDefiniton.getValue('sys_scope'))) {
            var newLocalSetURL = '<a href="sys_update_set.do?sys_id=-1">New Local Update Set</a>';
            this.tracker.fail(sn_i18n.Message.getMessage("global", "You are attempting to add a record to the system default update set, please create a {newLocalSetURL} and set that as your current update set.", {
                "newLocalSetURL": newLocalSetURL
            }));
            return false;
        }

        this.exportSolutionDefinition(capabilityDefiniton, maxCount);
        sn_ml.MLServiceUtil.exportMLSolutionToGlobalUpdateSet();

        if (maxCount > 0) {
            return true;
        }

        this.tracker.success();
    },

    exportSolutionDefinition: function(capabilityDefiniton, maxCount) {
        try {
            this.saveRecord(capabilityDefiniton);
            this.saveDependentSolutions(capabilityDefiniton, capabilityDefiniton.capability.value);
            var solutions = this.getRelatedRecords('ml_solution', 'ml_capability_definition', capabilityDefiniton.getUniqueValue());
            var solutionFound = false;
            var count = 1; //Limit solutions to maxCount
            while (solutions.next()) {
                if (solutionFound && count > maxCount) return;
                if (solutions.active == true) solutionFound = true;
                this.tracker.updateMessage(gs.getMessage('Adding records for solution {0} version {1}', [solutions.solution_name, solutions.version]));
                solutions.setValue('progress_tracker', '');
                solutions.update();
                this.saveRecord(solutions);

                this.addRelatedRecords('ml_pc_lookup', 'solution', solutions.getUniqueValue());
                this.addRelatedRecords('ml_class', 'solution', solutions.getUniqueValue());
                this.addRelatedRecords('ml_model_artifact', 'solution', solutions.getUniqueValue());
                this.addRelatedRecords('ml_excluded_classes', 'solution', solutions.getUniqueValue());
                this.addRelatedRecords('ml_advanced_solution_settings', 'ml_capability_definition', capabilityDefiniton.getUniqueValue());

                var wvCorpus = solutions.getValue('word_vector_corpus');
                this.addRelatedRecords('ml_word_vector_corpus', 'sys_id', wvCorpus);
                this.addRelatedRecords('ml_word_vector_corpus_details', 'word_vector_corpus', wvCorpus);

                var wvCorpusVersion = solutions.getValue('wvc_version');
                this.addRelatedRecords('ml_word_vector_corpus_versions', 'sys_id', wvCorpusVersion);
                this.addRelatedRecords('ml_model_artifact', 'word_corpus', wvCorpusVersion);

                var wvCorpusVersionGr = new GlideRecord('ml_word_vector_corpus_versions');
                wvCorpusVersionGr.addQuery('sys_id', wvCorpusVersion);
                wvCorpusVersionGr.query();
                if (wvCorpusVersionGr.next()) {
                    var wvCorpusModelArtifact = wvCorpusVersionGr.getValue('model_artifact');
                    this.addRelatedRecords('ml_model_artifact', 'sys_id', wvCorpusModelArtifact);
                }

                this.saveDependentSolutions(solutions, solutions.getValue('capability'));

                if (JSUtil.notNil(solutions.getValue('stopwords'))) {
                    var stopwords = solutions.getValue('stopwords').split(",");
                    for (var i = 0; i < stopwords.length; i++) {
                        var stopwordId = stopwords[i];
                        this.addRelatedRecords('ml_stopwords', 'sys_id', stopwordId);
                    }
                }
                count += 1;
            }
            var gr1 = new GlideRecord('sysauto');
            gr1.addQuery('name', capabilityDefiniton.getUniqueValue());
            gr1.addQuery('run_type', 'periodically');
            gr1.query();
            if (gr1.next()) {
                this.saveRecord(gr1);
            }
        } catch (error) {
            this.tracker.fail(error.message);
        }
    },

    saveDependentSolutions: function(glideRecord, capability) {
        var dependentSolutionList = [];
        if (capability == this.CAPABILITY_NLU) {
            dependentSolutionList = this.getDependentFuzzyMatcherSolutions(glideRecord);
        }
        for (var i in dependentSolutionList) {
            var gr = new GlideRecord('ml_capability_definition_base');
            gr.addQuery('solution_name', dependentSolutionList[i]);
            gr.query();
            if (gr.next()) {
                this.exportSolutionDefinition(gr);
            }
        }
    },

    getDependentFuzzyMatcherSolutions: function(glideRecord) {
        var dependentSolutionList = [];
        var solutionPropertiesStr = glideRecord.getValue("solution_properties");
        if (JSUtil.notNil(solutionPropertiesStr)) {
            var solutionProperties = JSON.parse(solutionPropertiesStr);
            if (JSUtil.notNil(solutionProperties.authoringModel) && JSUtil.notNil(solutionProperties.authoringModel.lookupSources)) {
                var lookupSourceList = solutionProperties.authoringModel.lookupSources;
                for (var i in lookupSourceList) {
                    lookupSource = lookupSourceList[i];
                    if (JSUtil.notNil(lookupSource.solutionName)) {
                        dependentSolutionList.push(lookupSource.solutionName);
                    }
                }
            }
        }
        return dependentSolutionList;
    },

    getTotalRowCount: function(capabilityDefinitonId) {
        // Count ml_solution_definition record
        var count = 1;
        var solutions = this.getRelatedRecords('ml_solution', 'solution_definition', capabilityDefinitonId);
        while (solutions.next()) {
            // Count ml_solution record
            count++;
            // Add all solution related records (ml_class, ml_pc_lookup, ml_model_artifact)
            count += this.getRelatedRecords('ml_pc_lookup', 'solution', solutions.getUniqueValue()).getRowCount();
            count += this.getRelatedRecords('ml_class', 'solution', solutions.getUniqueValue()).getRowCount();
            count += this.getRelatedRecords('ml_model_artifact', 'solution', solutions.getUniqueValue()).getRowCount();
        }
        return count;
    },

    getRelatedRecords: function(tableName, referenceField, id) {
        var gr = new GlideRecord(tableName);
        if (JSUtil.notNil(id)) {
            gr.addQuery(referenceField, id);
            gr.query();
        }
        return gr;
    },

    addRelatedRecords: function(tableName, referenceField, id) {
        var gr = this.getRelatedRecords(tableName, referenceField, id);
        while (gr.next()) {
            this.saveRecord(gr);
            if (tableName == "ml_model_artifact") {
                this.addRecordAndAttachmentsToCurrentUpdateSet(tableName, gr.getUniqueValue());
            }
        }
    },

    addRecordAndAttachmentsToCurrentUpdateSet: function(tableName, recordID) {
        var att = new GlideRecord("sys_attachment");
        att.addQuery("table_name", tableName);
        att.addQuery("table_sys_id", recordID);
        att.query();
        while (att.next()) {
            if (parseInt(att.getValue("size_bytes")) > parseInt(this.UPDATESET_MAX_PAYLOAD_SIZE_BYTES)) {
                //Add each attachment to Update Set
                this.addAttachmentToUpdateSet(att);
            }

        }
    },

    addAttachmentToUpdateSet: function(attachmentGR) {
        this.saveRecord(attachmentGR);
        var attdoc = new GlideRecord("sys_attachment_doc");
        attdoc.addQuery("sys_attachment", attachmentGR.sys_id);
        attdoc.orderBy("position");
        attdoc.query();
        while (attdoc.next()) {
            this.saveRecord(attdoc);
        }
    },


    saveRecord: function(gr) {
        this.tracker.incrementProgressValue(1);
        var savedCorrectly = this.updateManager.saveRecord(gr);
        if (!savedCorrectly) {
            var errorMessage = gs.getMessage('Error while saving record {0}_{1}', [gr.getTableName(), gr.getUniqueValue()]);
            throw {
                message: errorMessage
            };
        }
    },

    checkForDefaultUpdateSet: function(appId) {
        var isDefault = true;
        var currentApp = gs.getCurrentApplicationId();
        var currentSetID = gs.getUser().getPreference('updateSetForScope' + currentApp);
        if (currentSetID) {
            var updateGr = new GlideRecord('sys_update_set');
            updateGr.get(currentSetID);
            isDefault = global.JSUtil.getBooleanValue(updateGr, 'is_default');
        }
        return isDefault;
    },

    type: 'SolutionExporter'
};
