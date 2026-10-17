var ImportNLUModel = Class.create();

var fileConstants = NLUConstants.FILE_CONSTANTS;
var tables = NLUConstants.tables;
var modelStates = NLUConstants.MODEL_STATE_TYPES;

function getOnStartScript(modelId) {
    return "(function runTransformScript(source, map, log, target) { \
        var importSetId = import_set.getUniqueValue(); \
        var dataSource = import_set.getValue('data_source'); \
        log.info('Import model onStart - importSetId: ' + importSetId + '; dataSource: ' + dataSource); \
        var gr = new GlideRecord('sys_data_source'); \
        if (gr.get(dataSource)) { \
            gr.setValue('properties', 'charset=utf-8'); \
            var result = gr.update(); \
            log.info('Import model onStart - update: ' + result); \
        } else { \
            log.info('Import model onStart - dataSource not found! " + modelId + "'); \
        } \
    })(source, map, log, target);";
}

function getOnBeforeScript(modelId) {
    return "(function runTransformScript(source, map, log, target) { \
        var intent = source.getValue('u_intent'); \
        if (!intent) { \
            ignore = true; \
        } else { \
            var intentId; \
            var nluModel = new NLUModel('" + modelId + "'); \
            var intentGr = nluModel.getIntents('name=' + intent); \
            if (intentGr.next()) { \
                intentId = intentGr.getUniqueValue(); \
            } \
            if (!intentId) { \
                var modelGr = nluModel.getGR(); \
                if (modelGr.primary_model) { \
                    var primaryNluModel = new NLUModel(modelGr.primary_model); \
                    primaryNluModel.createIntent(intent); \
                    intentGr = nluModel.getIntents('name=' + intent); \
                    if (intentGr.next()) { \
                        intentId = intentGr.getUniqueValue(); \
                    } \
                } else { \
                    intentId = nluModel.createIntent(intent); \
                } \
                if (intentId) { \
                    NLUSystemUtil.updateOrInsert('sys_nlu_intent', 'sys_id', intentId, { 'enable': true }); \
                } else { \
                    ignore = true; \
                } \
            } \
            target.intent = intentId; \
        } \
        if ((source.getValue('u_utterance') || '').trim() === '') { \
            ignore = true; \
        } \
    })(source, map, log, target);";
}

function getOnCompleteScript(modelId) {
    return "(function runTransformScript(source, map, log, target) { \
        var gr = new GlideRecord('" + tables.SYS_NLU_MODEL_STATUS + "'); \
        gr.addQuery('model', '" + modelId + "'); \
        gr.query(); \
        if (gr.next()) { \
            gr.setValue('state', '" + modelStates.draft + "'); \
            gr.update(); \
        } \
})(source, map, log, target);";
}

ImportNLUModel.importModel = function(data) {
    try {
        var fileName = data.file && data.file.name;
        var fileSize = data.file && data.file.size;
        var modelId = data.sysId;
        var language = data.language;
        var modelName = data.displayName;
        var category = data.category;
        var domain = data.modelDomain;
        var ct = data.confidenceThreshold;
        var description = data.description;

		// Check for Write access before proceeding
		var grAccessCheck = GlideRecord(tables.SYS_NLU_MODEL);
		if (!grAccessCheck.canWrite()) {
			throw new Error(gs.getMessage('User not authorized to import data to model'));
		}

        if (data.file) {
            if (!NLUModelFileUtil.checkFileSize(fileSize)) {
                throw new Error(gs.getMessage('File size exceeds max filesize of {0} MB', NLUModelFileUtil.getMaxFileSize()));
            }
            var fileArr = NLUModelFileUtil.getFileNameAndExtension(fileName, fileConstants.VALID_FILE_TYPES);
            if (!fileArr) {
                throw new Error(gs.getMessage('Please upload a file with a valid extension'));
            }
        }

        var fields = [{
                name: 'intent',
                length: 200
            },
            {
                name: 'utterance',
                length: 512
            }
        ];

        var stageTableStructure = NLUModelImportUtils.createStageTable('NLU Model Import Stage Table', fields);
        if (!stageTableStructure) {
            throw new Error(gs.getMessage('Failed to create a staging table for import set'));
        }

        // Create & associate a transform map for the stage table
        var mapSysId = NLUModelImportUtils.createTransformMap('NLU Model CSV Transform Map', stageTableStructure, tables.SYS_NLU_UTTERANCE, ['u_intent']);
        if (!mapSysId) {
            throw new Error(gs.getMessage('Failed to create transform map for staging table: {0}', stageTableStructure['tableName']));
        }

        var modelGr = NLUModel.getGRById(modelId);

        if (modelGr === null) {
            modelGr = new GlideRecordSecure(tables.SYS_NLU_MODEL);
            modelGr.initialize();
            modelGr.setValue('display_name', modelName);
            modelGr.setValue('category', category);
            modelGr.setValue('language', language);
            modelGr.setValue('confidence_threshold', ct);
            modelGr.setValue('description', description);
            if (domain) modelGr.setValue('model_domain', domain);
            modelId = modelGr.insert();
            if (!modelId) {
                throw new Error(gs.getMessage('Error while creating model'));
            }
        }

        NLUModelImportUtils.createTransformMapScripts(mapSysId, [{
                event: 'onStart',
                script: getOnStartScript(modelId)
            },
            {
                event: 'onBefore',
                script: getOnBeforeScript(modelId)
            },
            {
                event: 'onComplete',
                script: getOnCompleteScript(modelId)
            }
        ], ['global']);

        var statusGr = NLUModel.getModelStatusGr(modelId);
        statusGr.setValue('state', modelStates.importing);
        statusGr.update();

        return {
            status: 'success',
            modelId: modelId,
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

ImportNLUModel.prototype = {
    initialize: function() {},
    type: 'ImportNLUModel'
};
