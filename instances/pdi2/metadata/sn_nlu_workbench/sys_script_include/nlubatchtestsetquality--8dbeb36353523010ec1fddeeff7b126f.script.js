var NLUBatchTestSetQuality = Class.create();
(function() {
    var tables = NLUWorkbenchConstants.tables;
    var SYS_NLU_INTENT = global.NLUConstants.tables.SYS_NLU_INTENT;
    var arrayUtil = new global.ArrayUtil();

    var TYPE = {
        PASS: 'pass',
        WARNING: 'warning',
        ERROR: 'error'
    };

    var TITLE_GT_65 = gs.getMessage('This test set has a good coverage of intents and is good to use');
    var TITLE_LT_65 = function(coverage) {
        return gs.getMessage('Only {0}% of intents in this model are covered by the test set; 65% is recommended.', coverage);
    };
    var TITLE_LT_65_MULTI = function(coverage) {
        return gs.getMessage('Only {0}% of intents in the selected models are covered by the test set; 65% is recommended.', coverage);
    };
    var MESSAGE_LT_65 = gs.getMessage('You can still run batch test with this test set, but the recommended threshold may not be optimal.');
    var MESSAGE_LT_65_OPT = gs.getMessage('You can still run optimization with this test set, but you could get a better optimized model by improving the test set.');
    var MESSAGE_LT_25_OPT = gs.getMessage('Add more utterances to this test set and try again, or select another test set.');

    function getUniqueExpectedIntents(testSetId, modelIntentNames, qc) {
        var uniqueExpectedIntents = []; // list of expected intents which are part of model
        var skippedIntents = []; // all the intents which are not present in the model(s)
        var ag = new GlideAggregate(tables.NLU_BATCH_TEST_UTTERANCE);
        var encodedQuery = 'test_set=' + GlideStringUtil.escapeQueryTermSeparator(testSetId);
        if (qc)
            encodedQuery += ('^' + qc);
        ag.addEncodedQuery(encodedQuery, true);
        ag.addAggregate('COUNT', 'intent');
        ag.query();
        while (ag.next()) {
            if (gs.nil(ag.getValue('intent'))) continue;

            var intentNamesArr = ag.intent.split(',');
            var validIntents = [];
            intentNamesArr.forEach(function(intent) {
                var intentName = NLUCoreUtils.toLower(intent);
                if (arrayUtil.indexOf(modelIntentNames, intentName) > -1) {
                    validIntents.push(intentName);
                } else if (arrayUtil.indexOf(skippedIntents, intent) === -1) {
                    skippedIntents.push(intent);
                }
            });

            if (validIntents.length === intentNamesArr.length) {
                uniqueExpectedIntents = arrayUtil.union(uniqueExpectedIntents, validIntents);
            }
        }
        return {
            expectedIntents: uniqueExpectedIntents,
            skippedIntents: skippedIntents,
        };
    }

    function getSkipedUtterancesCount(testSetId, skippedIntentNames) {
        if (skippedIntentNames && skippedIntentNames.length > 0) {
            var ga = new GlideAggregate(tables.NLU_BATCH_TEST_UTTERANCE);
            ga.addQuery('test_set', testSetId);
            var query = '';
            skippedIntentNames.forEach(function(eachIntent) {
                query += (query ? '^OR' : '') + 'intentLIKE' + eachIntent;
            });
            ga.addEncodedQuery(query);
            ga.addAggregate('COUNT');
            ga.query();
            if (ga.next()) {
                return parseInt(ga.getAggregate('COUNT'));
            }
        }
        return 0;
    }

    function getIntentCoverage(models, testSetId, modelIntentNames, isOptimize) {
        var type = TYPE.PASS,
            title = TITLE_GT_65,
            message = '';

        var expectedAndSkipped = getUniqueExpectedIntents(testSetId, modelIntentNames);
        var expectedIntentNames = expectedAndSkipped.expectedIntents;
        var skippedIntentNames = expectedAndSkipped.skippedIntents;

        var skipedUtterances = getSkipedUtterancesCount(testSetId, skippedIntentNames);

        var intentsCovered = expectedIntentNames.length;
        var totalIntents = arrayUtil.unique(modelIntentNames).length;
        var intentCoverage = totalIntents > 0 ? parseFloat(NLUCoreUtils.getPercentage(intentsCovered / totalIntents)) : 0;

        if (intentCoverage < 65) {
            type = TYPE.WARNING;
            title = models.length === 1 ? TITLE_LT_65(intentCoverage) : TITLE_LT_65_MULTI(intentCoverage);
            message = isOptimize ? MESSAGE_LT_65_OPT : MESSAGE_LT_65;
            if (isOptimize && intentCoverage < 25) {
                type = TYPE.ERROR;
                message = MESSAGE_LT_25_OPT;
            }
        }
        return {
            name: 'intentCoverage',
            type: type,
            value: {
                total: totalIntents,
                covered: intentsCovered,
                coverage: intentCoverage
            },
            message: message,
            skipedUtterances: skipedUtterances,
            title: title
        };
    }

    NLUBatchTestSetQuality.getTestSetQuality = function(models, testSetId, isOptimize) {
        var qualitiesArray = [],
            res = {
                qualityCheck: TYPE.PASS
            };
        var modelIntentNamesMap = NLUCoreUtils.getTrainedIntentNamesMap(models, NLUCoreUtils.toLower);
        var modelIntentNames = [];
        for (var modelId in modelIntentNamesMap) {
            var intentNames = modelIntentNamesMap[modelId].intents;
            if (intentNames && intentNames.length > 0) {
                arrayUtil.concat(modelIntentNames, intentNames);
            }
        }
        var intentCoverage = getIntentCoverage(models, testSetId, modelIntentNames, isOptimize);
        qualitiesArray.push(intentCoverage);
        if (intentCoverage.type === TYPE.WARNING || intentCoverage.type === TYPE.ERROR) {
            if (res.qualityCheck !== TYPE.ERROR) {
                res.qualityCheck = intentCoverage.type;
            }
        }
        res.qualityData = qualitiesArray;
        return res;
    };

    /*
	NOTE: Test coverage is same as IntentCoverage - but it is calculated for default test set
	using only enabled intents (unlike only trained intents in Intent coverage)
    */
    NLUBatchTestSetQuality.getTestCoverage = function(modelId) {
        var intentGr = new GlideRecord(SYS_NLU_INTENT);
        intentGr.addQuery('model', modelId);
        intentGr.addQuery('enable', true);
        intentGr.query();
        var modelIntentNames = [];
        while (intentGr.next()) {
            modelIntentNames.push(NLUCoreUtils.toLower(intentGr.getValue('name')));
        }

        var testSetGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        testSetGr.addQuery('model', modelId);
        testSetGr.query();
        if (testSetGr.next()) {
            return getIntentCoverage([modelId], testSetGr.getUniqueValue(), modelIntentNames).value;
        }

        throw new Error('No default test set found for model ' + modelId);
    };

    function getTestUtterances(testSetId) {
        var testUttrGr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        testUttrGr.addQuery('test_set', testSetId);
        testUttrGr.query();
        var testUtterances = [];
        while (testUttrGr.next()) {
            testUtterances.push(testUttrGr.getValue('utterance'));
        }

        return testUtterances;
    }

    function getIntentNames(modelId, encodedQuery) {
        var intentGr = new GlideRecord(SYS_NLU_INTENT);
        intentGr.addQuery('model', modelId);
        if (encodedQuery)
            intentGr.addEncodedQuery(encodedQuery);
        intentGr.query();
        var intents = [];
        while (intentGr.next()) {
            intents.push(NLUCoreUtils.toLower(intentGr.getValue('name')));
        }

        return intents;
    }

    function getDefaultTestSetId(modelId) {
        var testSetGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
        testSetGr.addQuery('model', modelId);
        testSetGr.query();
        if (testSetGr.next())
            return testSetGr.getUniqueValue();

        throw new Error('No default test set found for model ' + modelId);
    }

    NLUBatchTestSetQuality.getSkippedUtterancesCountForClone = function(modelId, testSetId) {
        // 1. Filter utterances that are already present in defaultTestSet
        var defaultUttrs = getTestUtterances(getDefaultTestSetId(modelId));
        var copyFromUttrs = getTestUtterances(testSetId);

        var uniqueUttrs = arrayUtil.diff(copyFromUttrs, defaultUttrs);

        // 2. Filter utterances whose expected intents are not in model
        var modelIntents = getIntentNames(modelId);
        var qc = 'utteranceIN' + uniqueUttrs.join(',');
        var skippedIntents = getUniqueExpectedIntents(testSetId, modelIntents, qc).skippedIntents;

        var skipUttrCount = getSkipedUtterancesCount(testSetId, skippedIntents);
		var duplicateUttrCount = arrayUtil.intersect(defaultUttrs, copyFromUttrs).length;
        return skipUttrCount + duplicateUttrCount;
    };

    NLUBatchTestSetQuality.prototype = {
        initialize: function() {},
        type: 'NLUBatchTestSetQuality'
    };
})();
