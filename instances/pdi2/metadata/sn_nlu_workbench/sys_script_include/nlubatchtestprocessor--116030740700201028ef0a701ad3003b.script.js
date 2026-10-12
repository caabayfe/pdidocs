var NLUBatchTestProcessor = Class.create();

var constants = NLUWorkbenchConstants.constants;
var tables = NLUWorkbenchConstants.tables;

function getOnStartScript(testSetId) {
    return "(function runTransformScript(source, map, log, target) { \
    var importSetId = import_set.getUniqueValue(); \
	var dataSource = import_set.getValue('data_source'); \
	var updatedData = { properties: 'charset=utf-8' }; \
    global.NLUSystemUtil.updateOrInsert('sys_data_source', 'sys_id', dataSource, updatedData); \
    var gr = new GlideRecord('" + tables.NLU_BATCH_TEST_SET + "'); \
    if (gr.get('" + testSetId + "')) { \
        gr.setValue('status', 'uploading'); \
        gr.setValue('import_set', importSetId); \
        gr.update(); \
    } \
})(source, map, log, target);";
}

function getOnBeforeScript(testSetId) {
    return "(function runTransformScript(source, map, log, target) { \
	var expectedintent = source.getValue('u_expected_intent');\
	if(expectedintent != null && expectedintent.toLowerCase() == 'not relevant') { \
		source.setValue('u_expected_intent',''); \
		expectedintent = '';\
	} \
	if(typeof expectedintent === 'string' && expectedintent.split(',').length > " + constants.MAX_EXPECTED_INTENTS + ") { \
		ignore = true; \
	}\
    target.test_set = '" + testSetId + "'; \
})(source, map, log, target);";
}

function getOnBeforeScriptDefaultTestset(testSetId, modelIntents) {
    return "(function runTransformScript(source, map, log, target) { \
	var expectedintent = source.getValue('u_expected_intent');\
	target.test_set = '" + testSetId + "'; \
	if(expectedintent != null && expectedintent.toLowerCase() == 'not relevant') { \
        source.setValue('u_expected_intent',''); \
        expectedintent = '';\
    } \
	var modelIntents = " + JSON.stringify(modelIntents) + ";\
	ignore = NLUBatchTestSet.canIgnoreUtterance(expectedintent, modelIntents);\
	if (!ignore) {\
	    var expectedIntentsArr = NLUBatchTestSet.getMappedModelIntents(expectedintent, modelIntents); \
	    source.setValue('u_expected_intent', expectedIntentsArr.join(',')); \
	}\
})(source, map, log, target);";
}

function getOnCompleteScript(testSetId) {
    return "(function runTransformScript(source, map, log, target) { \
    var gr = new GlideRecord('" + tables.NLU_BATCH_TEST_SET + "'); \
    if (gr.get('" + testSetId + "')) { \
        gr.setValue('status', error ? 'upload_failed' : 'uploaded'); \
        gr.update(); \
    } \
})(source, map, log, target);";
}

(function() {
    NLUBatchTestProcessor.createBatchTestSet = function(data) {
        try {
            var fileName = data.file && data.file.name;
            var fileSize = data.file && data.file.size;
            var testSetName = data.name;
            var testSetLanguage = data.language;
            var testSetId = data.testSetId;
            var associatedModel = data.model;

            // Basic validations of file:
            if (data.file) {
                if (!NLUFileUtil.checkFileSize(fileSize)) {
                    throw new Error(gs.getMessage('File size exceeds max filesize of {0} MB', NLUFileUtil.getMaxFileSize()));
                }
                var fileArr = NLUFileUtil.getFileNameAndExtension(fileName, constants.VALID_FILE_TYPES);
                if (!fileArr) {
                    throw new Error(gs.getMessage('Please upload a file with a valid extension'));
                }
                var fileNameWithoutExt = fileArr[0];
            }

            // Create record in nlu_batch_test_set
            if (!testSetId) {
                testSetId = NLUBatchTestSet.addRecord(
                    testSetName || fileNameWithoutExt,
                    testSetLanguage || constants.DEFAULT_LANGUAGE, !data.file && 'uploaded', associatedModel);
                if (!testSetId) {
                    throw new Error(gs.getMessage('Failed to create a batch test set record'));
                }
            }

            if (!data.file) {
                return {
                    status: 'success',
                    testSetId: testSetId,
                };
            }

            // Create staging table for import set
            var fields = [{
                    name: 'expected_intent',
                    length: 500
                },
                {
                    name: 'utterance',
                    length: 512
                }
            ];
            var stageTableStructure = NLUImportSetUtils.createStageTable('NLU Batch Test Stage Table', fields);
            if (!stageTableStructure) {
                throw new Error(gs.getMessage('Failed to create a staging table for import set'));
            }

            // Create & associate a transform map for the stage table
            var mapSysId = NLUImportSetUtils.createTransformMap('NLU Batch Test Transform Map',
                stageTableStructure, tables.NLU_BATCH_TEST_UTTERANCE, testSetId, {
                    u_expected_intent: 'intent'
                });
            if (!mapSysId) {
                throw new Error(gs.getMessage('Failed to create transform map for staging table: {0}', stageTableStructure['tableName']));
            }
            NLUImportSetUtils.createTransformMapScripts(mapSysId, [{
                    event: 'onStart',
                    script: getOnStartScript(testSetId)
                },
                {
                    event: 'onBefore',
                    script: associatedModel ?
                        getOnBeforeScriptDefaultTestset(testSetId, NLUBatchTestSet.getModelIntentsFromTestId(testSetId)) : getOnBeforeScript(testSetId)
                },
                {
                    event: 'onComplete',
                    script: getOnCompleteScript(testSetId)
                }
            ], 'sn_nlu_workbench');

            return {
                status: 'success',
                testSetId: testSetId,
                stageTable: stageTableStructure['tableName'],
                transformMap: mapSysId
            };
        } catch (e) {
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUBatchTestProcessor.prototype = {
        initialize: function() {},
        type: 'NLUBatchTestProcessor'
    };

})();
