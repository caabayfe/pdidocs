var ScriptingGeneratorHandlerBase = Class.create();
ScriptingGeneratorHandlerBase.prototype = {
    getId: function() {
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('getId of base scripting generator handler is called.');
    },

    getOutputSchema: function() {
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('getOutputSchema of base scripting generator handler is called.');
        return {
            'status': Constants.STATUS_SUCCESS,
            'schema': [],
            'metaData': {}
        };
    },

    getOutputs: function(param) {
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('getOutputs of base scripting generator handler is called.');
        return {
            'status': Constants.STATUS_SUCCESS,
            'outputs': []
        };
    },

    type: 'ScriptingGeneratorHandlerBase'
};
