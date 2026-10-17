var InputGeneratorImpl = Class.create();
InputGeneratorImpl.prototype = {
    initialize: function() {
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
        this.inputPillParser = new sn_nb_action.NBAActionInputPillParser();
    },

    /*
     * Returns a JSON Object of outputs after running input generator subflow
     */
    runInputGenerator: function(inputGeneratorRecord, currentRecord) {
        var flowRecord = inputGeneratorRecord[sn_nb_action.Constants.COL_INPUT_GENERATOR_FLOW].getRefRecord();
        if (flowRecord.getValue(sn_nb_action.Constants.COL_ACTIVE) == 0 || inputGeneratorRecord.getValue(sn_nb_action.Constants.COL_ACTIVE) == 0)
            return false;

        var outputs = false;
        try {
            var flowInput = this._getInputObject(inputGeneratorRecord, currentRecord);
            if (!flowInput)
                this._log.error("Failed to parse flow inputs for input generator record " + inputGeneratorRecord.getUniqueValue());

            var flowName = flowRecord.getValue(sn_nb_action.Constants.COL_INTERNAL_NAME);
            var scope = flowRecord[sn_nb_action.Constants.COL_SYS_SCOPE][sn_nb_action.Constants.COL_SCOPE] + '';

            if (gs.getProperty(sn_nb_action.Constants.PROP_DEBUG_FLOW) == 'true')
                outputs = sn_fd.FlowAPI.executeSubflow(scope + '.' + flowName, flowInput);
            else
                outputs = sn_fd.FlowAPI.executeSubflowQuick(scope + '.' + flowName, flowInput);
        } catch (ex) {
            this._log.error("Failed to evaluate input generator flow for input generator record " + inputGeneratorRecord.getUniqueValue());
        }
        return outputs;
    },

    /*
     * Returns a JSON Object of inputs needed to run input generator subflow
     */
    _getInputObject: function(inputGeneratorRecord, currentRecord) {
        var inputs = false;
        try {
            inputs = this.inputPillParser.parseFlowInputsPill(inputGeneratorRecord[sn_nb_action.Constants.COL_GENERATOR_INPUT], currentRecord);
        } catch (ex) {
            this._log.error("Failed to parse flow inputs needed to run input input generator record " + inputGeneratorRecord.getUniqueValue());
        }
        return inputs;
    },

    type: 'InputGeneratorImpl'
};
