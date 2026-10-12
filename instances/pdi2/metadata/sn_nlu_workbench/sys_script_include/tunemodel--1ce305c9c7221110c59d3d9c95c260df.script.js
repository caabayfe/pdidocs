var TuneModel = Class.create();

(function() {
    var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;

    function getModelName(modelId) {
        var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (modelGr.get(modelId)) {
            return modelGr.getValue('name');
        }
        return null;
    }

    function getModelId(modelName) {
        var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        modelGr.addQuery('name', modelName);
        modelGr.query();
        if (modelGr.next()) {
            return modelGr.getUniqueValue();
        }
        return null;
    }

    function shuffleIds(ultIds) {
        for (var i = ultIds.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = ultIds[i];
            ultIds[i] = ultIds[j];
            ultIds[j] = temp;
        }
        return ultIds;
    }

    TuneModel.prototype = {
        initialize: function(modelId, removedIds, trainPercent) {
            this.modelId = modelId;
            this.removedIds = removedIds;
            this.trainPercent = trainPercent;
        },

        tuneModel: function() {
            var modelName = getModelName(this.modelId);
            var encodedQuery = 'labelSTARTSWITHintent:' + modelName;
            if (this.removedIds.length > 0) {
                encodedQuery = encodedQuery + '^sys_idNOT IN' + this.removedIds.join(',');
            }
            var statusGr = new GlideRecord(tables.SYS_NLU_MODEL_STATUS);
            statusGr.addEncodedQuery('model.name=' + modelName);
            statusGr.query();

            var ultGr = new GlideRecord(tables.ULT);
            ultGr.addEncodedQuery(encodedQuery);
            ultGr.addQuery('product', 'nlu');
            ultGr.addQuery('source', 'virtual_agent');
            if (statusGr.next() && statusGr.getValue('last_tuned_on')) {
                ultGr.addQuery('sys_updated_on', '>=', statusGr.getValue('last_tuned_on'));
            }
            ultGr.query();
            var targetModelsMap = {};
            targetModelsMap[modelName] = [];
            while (ultGr.next()) {
                var correctLabel = ultGr.getValue('correct_label');
                var recId = ultGr.getUniqueValue();
                if (!correctLabel) {
                    targetModelsMap[modelName].push(recId);
                } else {
                    /**
                     * label is of the format `intent:${modelName}.${intentName}`
                     * correctLabel.substring(7) gives us modelIntentStr `${modelName}.${intentName}`
                     * by splitting modelIntentStr using . as delimitter we get array of two values [$modelName, $intentName]
                     */
                    var modelIntentStr = correctLabel.substring(7);
                    var tgtModel = modelIntentStr.split('.')[0];
                    if (targetModelsMap[tgtModel]) {
                        targetModelsMap[tgtModel].push(recId);
                    } else {
                        targetModelsMap[tgtModel] = [recId];
                    }
                }
            }

            // add feedback to models
            for (var key in targetModelsMap) {
                var feedback;
                var modelGr = global.NLUModel.getGRByName(key);
                if (!modelGr || modelGr.getValue('oob') == '1')
                    continue;

                // randomise sysIds
                targetModelsMap[key] = shuffleIds(targetModelsMap[key]);
                var trainIdsIdx = Math.floor((this.trainPercent / 100) * targetModelsMap[key].length);

                // add feedback to model intents
                ultGr = new GlideRecord(tables.ULT);
                ultGr.addEncodedQuery('sys_idIN' + targetModelsMap[key].slice(0, trainIdsIdx).join(','));
                ultGr.addQuery('label_type', '!=', 'irrelevant');
                ultGr.addQuery('label_type', '!=', 'irrelevant_to_this_model');
                ultGr.query();

                while (ultGr.next()) {
                    feedback = ultGr.getValue('label_type');
                    if (!(feedback == 'negative' && !ultGr.getValue('correct_label'))) {
                        var tgtIntentId = (key == modelName && feedback == 'positive') ? ultGr.getValue('label_reference') : ultGr.getValue('correct_label_reference');
                        var uttGr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
                        uttGr.initialize();
                        uttGr.setValue('utterance', ultGr.getValue('text'));
                        uttGr.setValue('intent', tgtIntentId);
                        uttGr.setValue('source', 'expert_feedback');
                        uttGr.setValue('sys_scope', modelGr.getValue('sys_scope'));
                        if (uttGr.insert())
                            global.MLLabeledData.deleteRecords('sys_id=' + ultGr.getValue('sys_id'));
                    }
                }

                // add feedback to default test set
                var tgtModelId = getModelId(key);
                if (tgtModelId) {
                    var defaultTestGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
                    defaultTestGr.addQuery('model', tgtModelId);
                    defaultTestGr.query();

                    if (defaultTestGr.next()) {
                        ultGr = new GlideRecord(tables.ULT);
                        ultGr.addEncodedQuery('sys_idIN' + targetModelsMap[key].slice(trainIdsIdx).join(','));
                        ultGr.query();

                        while (ultGr.next()) {
                            feedback = ultGr.getValue('label_type');
                            if (!(feedback == 'negative' && !ultGr.getValue('correct_label'))) {
                                var tgtIntent = (key == modelName && feedback == 'positive') ? ultGr.label_reference.name : ultGr.correct_label_reference.name;
                                var testUttGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
                                testUttGr.initialize();
                                testUttGr.setValue('test_set', defaultTestGr.getUniqueValue());
                                testUttGr.setValue('utterance', ultGr.getValue('text'));
                                if (feedback != 'irrelevant' && feedback != 'irrelevant_to_this_model') {
                                    testUttGr.setValue('intent', tgtIntent);
                                }
                                testUttGr.setValue('source', 'expert_feedback');

                                if (testUttGr.insert())
                                    global.MLLabeledData.deleteRecords('sys_id=' + ultGr.getValue('sys_id'));
                            }
                        }
                    } else {
                        gs.debug('NLU EFL Tune: default testset not found for model: ' + key);
                    }
                } else {
                    gs.debug('NLU EFL Tune: model Id not found for modelname ' + key);
                }
            }

            // update last tuned date
            var statusGr = new GlideRecord(tables.SYS_NLU_MODEL_STATUS);
            statusGr.addQuery('model', this.modelId);
            statusGr.query();
            if (statusGr.next()) {
                statusGr.setValue('last_tuned_on', new GlideDateTime());
                statusGr.update();
            }

            statusGr = global.NLUModel.getModelStatusGr(this.modelId);

            return {
                status: 'success',
                lastTunedDate: statusGr ? statusGr.getValue('last_tuned_on') : null
            };
        },

        type: 'TuneModel'
    };
})();
