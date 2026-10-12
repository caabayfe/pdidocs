var NLUBatchTestSet = Class.create();

(function() {

    var coreTables = global.NLUConstants.tables;
    var tables = NLUWorkbenchConstants.tables;

    NLUBatchTestSet.addRecord = function(name, language, status, model) {
        var record = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        record.initialize();
        record.setValue('name', name);
        record.setValue('language', language);
        if (status) record.setValue('status', status);
        if (model) record.setValue('model', model);
        return record.insert();
    };

    NLUBatchTestSet.cloneTestSetForModel = function(srcModelId, targetModelId) {
        try {
            var result = NLUBatchTestSet.getTestSetIdFromModel(srcModelId, targetModelId);
            if (result.status === 'success') {
                return NLUBatchTestSet.copyTestSetData(result.sourceTestSetId, result.targetTestSetId);
            }
            return result;
        } catch (e) {
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestSet.getTestSetIdFromModel = function(srcModelId, targetModelId) {
        var srcGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        srcGr.addEncodedQuery("model=" + srcModelId);
        srcGr.query();

        var tgtGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        tgtGr.addEncodedQuery("model=" + targetModelId);
        tgtGr.query();

        if (srcGr.next() && tgtGr.next()) {
            return {
                status: 'success',
                sourceTestSetId: srcGr.getValue('sys_id'),
                targetTestSetId: tgtGr.getValue('sys_id')
            };
        } else {
            throw new Error(gs.getMessage('Missing source/target modelId'));
        }
    };

    NLUBatchTestSet.getTestUtteranceCount = function(modelId, intentName) {
        var testUtteranceCount = 0;
        var testUtteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        var joinGr = testUtteranceGr.addJoinQuery(tables.NLU_BATCH_TEST_SET, 'test_set', 'sys_id');
        testUtteranceGr.addEncodedQuery("intentLIKE" + intentName);
        joinGr.addCondition('model', modelId);
        testUtteranceGr.query();

        while (testUtteranceGr.next()) {
            var intentsStr = testUtteranceGr.getValue('intent');
            var intents = intentsStr.split(',').map(function(intent) {
                return intent.trim().toLowerCase();
            });
            if (intents.indexOf(intentName.trim().toLowerCase()) !== -1) testUtteranceCount++;
        }

        return testUtteranceCount;
    };

    /*
    	Used in NLUBatchTestProcessor for importing test utterances via csv, xlsx, etc.
    	Ignore import of utterances whose expected intent is not in the model
    */
    NLUBatchTestSet.canIgnoreUtterance = function(expectedIntent, modelIntents) {
        if (!expectedIntent) {
            return false;
        }
        if (typeof expectedIntent !== 'string') {
            return true;
        }

        var expectedIntentsArr = expectedIntent.split(',');
        if (expectedIntentsArr.length > NLUWorkbenchConstants.constants.MAX_EXPECTED_INTENTS) {
            return true;
        }
        var updatedModelIntents = modelIntents.map(function(intent) {
            return NLUCoreUtils.toLower(intent);
        });

        return canSkipUtterance(expectedIntentsArr, updatedModelIntents);
    };

    NLUBatchTestSet.getModelIntentsFromTestId = function(testSetId) {
        var testSetGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        if (!testSetGr.get(testSetId))
            throw new Error('Invalid Test Set Id');

        var gr = new GlideRecord(tables.SYS_NLU_INTENT);
        gr.addQuery('model', testSetGr.getValue('model'));
        gr.query();
        var intents = [];
        while (gr.next()) {
            intents.push(gr.getValue('name'));
        }

        return intents;
    };

    NLUBatchTestSet.getMappedModelIntents = function(expectedIntent, modelIntents) {
        var expectedIntentsArr = expectedIntent.split(',').map(function(intent) {
            return intent.trim();
        });
        var modelIntentsMap = {};
        modelIntents.forEach(function(intent) {
            modelIntentsMap[NLUCoreUtils.toLower(intent)] = intent;
        });
        var results = [];
        expectedIntentsArr.forEach(function(intent) {
            if (modelIntentsMap.hasOwnProperty(NLUCoreUtils.toLower(intent))) {
                results.push(modelIntentsMap[NLUCoreUtils.toLower(intent)]);
            }
        });

        return results;
    };

    function canSkipUtterance(testIntents, modelIntents) {
        return !testIntents.every(function(intent) {
            return modelIntents.indexOf(NLUCoreUtils.toLower(intent)) > -1;
        });
    }

    NLUBatchTestSet.canPerformEditOperations = function(testSetId) {
        if (typeof global.NLUSystemUtil.canPerformEditOperations === 'function') {
             var gr = new GlideRecord(tables.NLU_BATCH_TEST_SET);

        if (gr.get(testSetId)) {
            var modelId = gr.getValue('model');
            if (!modelId) {
                // test set is not default test set, so any nlu_editor can modify/create records
                return true;
            } else {
                return global.NLUSystemUtil.canPerformEditOperations(modelId);
            }
        }

        return false;
        }
        return true;
    }


    NLUBatchTestSet.copyTestSetData = function(sourceTestSetId, targetTestSetId) {
        if (!canPerformEditOperations(sourceTestSetId)) {
            return {
                status: 'Failure',
                message: 'User Does not have ACL permissions'
            };
        }

        var srcGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        srcGr.addQuery('test_set', sourceTestSetId);
        srcGr.query();

        var modelIntents = NLUBatchTestSet.getModelIntentsFromTestId(targetTestSetId).map(function(intent) {
            return NLUCoreUtils.toLower(intent);
        });
        var inserts = 0,
            total = 0;
        while (srcGr.next()) {
            ++total;
            var srcIntents = srcGr.getValue('intent');
            var srcIntentsArr = [];
            if (srcIntents) {
                srcIntentsArr = srcIntents.split(',');
            }

            // Skip import of utterances whose expected intent is not in the model
            if (canSkipUtterance(srcIntentsArr, modelIntents)) {
                continue;
            }
            var tgtGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
            tgtGr.addQuery('utterance', srcGr.getValue('utterance'));
            tgtGr.addQuery('test_set', targetTestSetId);
            tgtGr.query();

            var isNewRecord = false;
            if (!tgtGr.next()) {
                isNewRecord = true;
                tgtGr.initialize();
                tgtGr.setValue("test_set", targetTestSetId);
                tgtGr.setValue("utterance", srcGr.getValue("utterance"));
            }

            var tgtIntents = tgtGr.getValue('intent');
            var tgtIntentsArr = [];
            if (tgtIntents) {
                tgtIntentsArr = tgtIntents.split(',');
            }
            var newIntents = tgtIntentsArr.concat(srcIntentsArr).filter(function(elem, pos, arr) {
                return arr.indexOf(elem) === pos;
            });
            tgtGr.setValue("intent", newIntents.join(','));
            if (isNewRecord) {
                ++inserts;
                tgtGr.insert();
            } else {
                tgtGr.update();
            }
        }

        return {
            status: 'success',
            data: {
                inserts: inserts,
                total: total
            }
        };
    };

    NLUBatchTestSet.updateRecord = function(query, data) {
        var record = new GlideRecord(tables.NLU_BATCH_TEST_SET);

        if (query) {
            record.addEncodedQuery(query);
        }

        record.query();

        if (record.hasNext()) {
            var keys = Object.keys(data);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                record.setValue(key, data[key]);
            }

            record.updateMultiple();
        }
    };

    NLUBatchTestSet.canUserCreateUpdateRecord = function(testSetId, userId) {
            var gr = new GlideRecord(tables.NLU_BATCH_TEST_SET);

            if (gr.get(testSetId)) {
                var modelId = gr.getValue('model');

                if (!modelId) {
                    // test set is not default test set, so any nlu_editor can modify/create records
                    return true;
                }

                var modelGr = new GlideRecord(tables.SYS_NLU_MODEL_STATUS);
                modelGr.addQuery('model', modelId);
                modelGr.addEncodedQuery('authorIN' + userId);
                modelGr.query();

                if (modelGr.next()) {
                    return true;
                }
                return false;
            }

            return true;
        },

        NLUBatchTestSet.deleteTestUtterances = function(testUttrIds) {
            var testUttrGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
            testUttrGr.addEncodedQuery('sys_idIN' + testUttrIds.join(','));
            testUttrGr.query();

            if (testUttrGr.hasNext()) {
                testUttrGr.deleteMultiple();
            }
        },

        NLUBatchTestSet.prototype = {
            initialize: function(testSetId) {
                this.testSetId = testSetId;
            },

            getGR: function() {
                var gr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
                if (gr.get(this.testSetId))
                    return gr;
                return null;
            },

            update: function(data) {
                if (global.NLUHelper.isEmpty(data)) return;

                var gr = this.getGR();
                if (gr) {
                    Object.keys(data).forEach(function(eachField) {
                        gr.setValue(eachField, data[eachField]);
                    });
                    gr.update();
                }
            },

            setError: function(errorMessage) {
                this.update({
                    status: 'upload_failed',
                    error_message: errorMessage
                });
            },

            getName: function() {
                var gr = this.getGR();
                return gr && gr.getValue('name');
            },

            // This could be a costly operation, as there can be upto 10K utterances
            getUtterances: function(modelIds, skipUtterances) {
                var utterances = [];
                modelIds = Array.isArray(modelIds) ? modelIds.join(',') : modelIds;
                var modelIntentNamesMap = NLUCoreUtils.getTrainedIntentNamesMap(modelIds, NLUCoreUtils.toLower);
                var testUtteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
                testUtteranceGr.addQuery('test_set', this.testSetId);
                testUtteranceGr.query();
                var intentModelMap = {};
                while (testUtteranceGr.next()) {
                    var modelIntent = [];
                    var intents = (testUtteranceGr.getValue('intent') || '')
                        .split(',')
                        .map(function(intent) {
                            return intent.trim();
                        })
                        .filter(function(intent) {
                            var modelName = intentModelMap[intent];
                            if (modelName) {
                                modelIntent.push(modelName + '.' + intent);
                            }
                            return !modelName;
                        });

                    var skipThis = false;
                    if (intents.length > 0 && intents[0]) {
                        var validIntents = 0;
                        for (var modelId in modelIntentNamesMap) {
                            var modelName = modelIntentNamesMap[modelId].name;
                            var intentNames = modelIntentNamesMap[modelId].intents;
                            intents.forEach(function(testIntent) {
                                var isValid = intentNames.indexOf(NLUCoreUtils.toLower(testIntent)) > -1;
                                if (isValid) {
                                    intentModelMap[testIntent] = modelName;
                                    modelIntent.push(modelName + '.' + testIntent);
                                    validIntents++;
                                }
                            });
                        }
                        skipThis = skipUtterances && validIntents < intents.length;
                    }

                    if (!skipThis)
                        utterances.push({
                            utterance: testUtteranceGr.getValue('utterance'),
                            expectedIntents: modelIntent
                        });
                }
                return utterances;
            },

            getUtteranceCount: function() {
                var countQuery = new GlideAggregate(tables.NLU_BATCH_TEST_UTTERANCE);
                countQuery.addAggregate('COUNT');
                countQuery.addQuery('test_set', this.testSetId);
                countQuery.query();
                return countQuery.next() ? parseInt(countQuery.getAggregate('COUNT')) : 0;
            },

            getMaxIntentsCount: function() {
                var gr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
                gr.addQuery('intent', 'LIKE', '%,%');
                gr.addQuery('test_set', this.testSetId);
                gr.query();
                var intentCnt = 1;
                while (gr.next()) {
                    var thisCnt = gr.intent.split(',').length;
                    if (thisCnt > intentCnt) intentCnt = thisCnt;
                }
                return intentCnt;
            },

            getLastUpdatedOn: function() {
                var gr = this.getGR();
                var updatedOn = gr ? (new GlideDateTime(gr.sys_updated_on)).getValue() : 0;

                var utteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
                utteranceGr.addQuery('test_set', this.testSetId);
                utteranceGr.orderByDesc('sys_updated_on');
                utteranceGr.setLimit(1);
                utteranceGr.query();
                if (utteranceGr.next()) updatedOn = (new GlideDateTime(utteranceGr.sys_updated_on)).getValue();
                return updatedOn;
            },

            copyFromULT: function(modelName, filter) {
                var count = 0;
                var labeledDataGr = new GlideRecord(tables.ULT);
                var baseQuery = 'usage=nlu_batch_test^product=nlu';
                baseQuery += '^labelSTARTSWITHintent:' + modelName + '.^ORlabelSTARTSWITHmodel:' + modelName;
                if (filter) baseQuery += '^' + filter;
                labeledDataGr.addEncodedQuery(baseQuery + '^label_type=positive^NQ' + baseQuery + '^label_type=negative^correct_labelISNOTEMPTY');
                labeledDataGr.query();
                while (labeledDataGr.next()) {
                    var utterance = labeledDataGr.getValue('text');
                    var intent = labeledDataGr.label_reference.name.toString();
                    if (labeledDataGr.getValue('label_type') === 'negative' &&
                        !gs.nil(labeledDataGr.getValue('correct_label_reference'))) {
                        intent = labeledDataGr.correct_label_reference.name.toString();
                    }
                    if (this.addUtterance(utterance, intent))
                        count++;
                }
                return count;
            },

            addUtterance: function(utterance, intent) {
                var utteranceGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
                utteranceGr.initialize();
                utteranceGr.setValue('test_set', this.testSetId);
                utteranceGr.setValue('utterance', utterance);
                utteranceGr.setValue('intent', intent);
                return utteranceGr.insert();
            },

            type: 'NLUBatchTestSet'
        };
})();
