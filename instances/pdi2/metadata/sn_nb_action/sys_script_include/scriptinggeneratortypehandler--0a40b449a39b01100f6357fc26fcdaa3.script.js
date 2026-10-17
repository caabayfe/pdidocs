var ScriptingGeneratorTypeHandler = Class.create();
ScriptingGeneratorTypeHandler.prototype = Object.extendsObject(sn_nb_action.GeneratorTypeHandlerBase, {

    getId: function() {
        return Constants.GENERATOR_TYPE_SYS_ID.SCRIPTING;
    },

    getOutputSchema: function(param) {
        var scriptGr = param.inputs.script_include;
        if (scriptGr.isValidRecord && scriptGr.isValidRecord()) {
            var scriptImplementation = NextBestActionUtil.getScriptingGeneratorForScript(scriptGr);
            if (scriptImplementation && typeof scriptImplementation.getOutputSchema === "function") {
                try {
                    return scriptImplementation.getOutputSchema();
                } catch (e) {
                    var errorMessage = e.message;
                    var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'ScriptingGeneratorTypeHandler');
                    logger.error('Error executing getOutputSchema of ' + scriptGr.getUniqueValue() + '. Error: ' + errorMessage);
                    return {
                        'status': sn_nb_action.Constants.STATUS_ERROR,
                        'errorCode': 40002,
                        'errorMessage': errorMessage
                    };
                }
            }
        }
        var errorDetails = new RAExceptionManager('INVALID_SCRIPT_INCLUDE');
        logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'ScriptingGeneratorTypeHandler');
        logger.error('Script include ' + scriptGr.getUniqueValue() + ' is invalid');
        return {
            'status': sn_nb_action.Constants.STATUS_ERROR,
            'errorCode': errorDetails.getCode(),
            'errorMessage': errorDetails.getMessage()
        };
    },

    getOutputs: function(param) {
        var scriptGr = param.inputs.script_include;
        if (scriptGr.isValidRecord && scriptGr.isValidRecord()) {
            var scriptImplementation = NextBestActionUtil.getScriptingGeneratorForScript(scriptGr);
            if (scriptImplementation && typeof scriptImplementation.getOutputs === "function") {
                var trimmedParam = {
                    contextRecord: param.contextRecord
                };
                try {
                    return scriptImplementation.getOutputs(trimmedParam);
                } catch (e) {
                    var errorMessage = e.message;
                    var logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'ScriptingGeneratorTypeHandler');
                    logger.error('Error executing getOutputs of ' + scriptGr.getUniqueValue() + '. Error: ' + errorMessage);
                    return {
                        'status': sn_nb_action.Constants.STATUS_ERROR,
                        'errorCode': 40002,
                        'errorMessage': errorMessage
                    };
                }
            }
        }
        var errorDetails = new RAExceptionManager('INVALID_SCRIPT_INCLUDE');
        logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'ScriptingGeneratorTypeHandler');
        logger.error('Script include ' + scriptGr.getUniqueValue() + ' is invalid');
        return {
            'status': sn_nb_action.Constants.STATUS_ERROR,
            'errorCode': errorDetails.getCode(),
            'errorMessage': errorDetails.getMessage()
        };
    },

    type: 'ScriptingGeneratorTypeHandler'
});
