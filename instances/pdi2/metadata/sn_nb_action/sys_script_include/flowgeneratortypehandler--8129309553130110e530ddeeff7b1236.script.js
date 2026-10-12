var FlowGeneratorTypeHandler = Class.create();
FlowGeneratorTypeHandler.prototype = Object.extendsObject(sn_nb_action.GeneratorTypeHandlerBase, {
    initialize: function() {
        this._log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
    },

    getId: function() {
        return Constants.GENERATOR_TYPE_SYS_ID.FLOW;
    },

    isValid: function(param) {
        var resourceGenerator = param.resourceGeneratorRecord;
        var flow = resourceGenerator.generator;
        if (!(flow && flow.type == Constants.FLOW_TYPE_SUBFLOW)) {
            var msg = gs.getMessage('Select a subflow for the generator field in order to use the flow generator type.');
            return {
                'isValid': false,
                'errorMessage': msg
            };
        }
        return {
            'isValid': true
        };
    },

    getOutputSchema: function(param) {
        var flowRecord = param.generatorRecord;
        if (!flowRecord || !flowRecord.isValidRecord()) {
            var errorDetails = new RAExceptionManager('INVALID_FLOW');
            this._log.error(errorDetails.getMessage());
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': errorDetails.getCode(),
                'errorMessage': errorDetails.getMessage()
            };
        }

        var schemaObjectList = [];
        var gr = new GlideRecord(Constants.TBL_FLOW_OUTPUT);
        gr.addQuery(Constants.COL_NAME, Constants.VAR__M_SYS_HUB_FLOW_OUTPUT_PREFIX + flowRecord.getUniqueValue());
        gr.query();
        while (gr.next()) {
            var name = gr.getValue(Constants.COL_ELEMENT);
            var label = gr.getValue(Constants.COL_LABEL);
            var type = gr.getValue(Constants.COL_INTERNAL_TYPE);
            if (type == Constants.TYPE_REFERENCE) {
                NextBestActionUtil.addToSchema(schemaObjectList, name, label, type, gr.getValue(Constants.COL_REFERENCE));
            } else {
                NextBestActionUtil.addToSchema(schemaObjectList, name, label, type);
            }
        }

        return {
            'status': Constants.STATUS_SUCCESS,
            'schema': schemaObjectList,
            'metaData': {}
        };
    },

    getOutputs: function(param) {
        var flowRecord = param.generatorRecord;
        var flowInputs = param.inputs;
        if (!flowRecord || !flowRecord.isValidRecord() || flowRecord.getValue(Constants.COL_ACTIVE) == 0) {
            var errorDetails = new RAExceptionManager('INVALID_OR_INACIVE_FLOW');
            this._log.error(errorDetails.getMessage());
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': errorDetails.getCode(),
                'errorMessage': errorDetails.getMessage()
            };
        }

        var flowOutputs;
        try {
            var flowName = flowRecord.getValue(Constants.COL_INTERNAL_NAME);
            var scope = flowRecord[Constants.COL_SYS_SCOPE][Constants.COL_SCOPE] + '';

            if (gs.getProperty(Constants.PROP_DEBUG_FLOW) == 'true') {
                flowOutputs = sn_fd.FlowAPI.executeSubflow(scope + '.' + flowName, flowInputs);
            } else {
                flowOutputs = sn_fd.FlowAPI.executeSubflowQuick(scope + '.' + flowName, flowInputs);
            }
        } catch (ex) {
            this._log.error('Failed to evaluate flow ' + flowRecord.getUniqueValue() + '. Error: ' + ex);
            errorDetails = new RAExceptionManager('UNKNOWN_ERROR_OCCURED');
            return {
                'status': Constants.STATUS_ERROR,
                'errorCode': errorDetails.getCode(),
                'errorMessage': errorDetails.getMessage()
            };
        }

        if (this._checkValidResourceGeneratorOutput(flowOutputs) && this._checkOutputArrayLengthConsistent(flowOutputs)) {
            flowOutputs = this._convertGlideRecordOutputsToArray(flowOutputs);
            var generatorOutputs = this._consolidateFlowOutputObject(flowOutputs);
            return {
                'status': Constants.STATUS_SUCCESS,
                'outputs': generatorOutputs
            };
        }

        errorDetails = new RAExceptionManager('INVALID_FLOW_OUTPUT');
        return {
            'status': Constants.STATUS_ERROR,
            'errorCode': errorDetails.getCode(),
            'errorMessage': errorDetails.getMessage()
        };

    },

    _checkValidResourceGeneratorOutput: function(flowOutputs) {
        var message = 'Flow output is empty, null or undefined';
        if (!flowOutputs) {
            this._log.warn(message);
            return false;
        }
        for (var outputVariable in flowOutputs) {
            if (flowOutputs[outputVariable] == null) {
                this._log.warn(message);
                return false;
            }
        }
        return true;
    },

    _checkOutputArrayLengthConsistent: function(flowOutputs) {
        if (this._getArrayAttribute(flowOutputs) && !this._isArrayOutputLengthConsistent(flowOutputs)) {
            return false;
        }
        return true;
    },

    //gets an attribute which has value of type array/list of records else returns false
    _getArrayAttribute: function(object) {
        for (var key in object) {
            if (Array.isArray(object[key]) || ((object[key] instanceof GlideRecord) && !object[key].isValidRecord())) {
                return key;
            }
        }
        return false;
    },

    //object attributes storing value of array type must have equal and non zero array length. If not returns false
    _isArrayOutputLengthConsistent: function(object) {
        var arrayLength = 0;
        var flag = 1;
        for (var key in object) {
            var len = this._getLengthOfList(key, object);
            if (len == -1) {
                continue;
            }

            if (arrayLength != len && arrayLength == 0) {
                arrayLength = len;
            } else if (arrayLength != len) {
                flag = 0;
                break;
            }
        }
        if (arrayLength == 0) {
            this._log.warn('Flow output returns atleast one empty array/list of records. Flow generator outputs are mandatory inputs for a recommended action.');
            return false;
        } else if (flag == 0) {
            this._log.warn('Flow output returns multiple outputs of array/list of records type of unequal length.');
            return false;
        }
        return true;
    },

    //get length of output attribute of array/list of records type. returns -1 if no attribute of this type found.
    _getLengthOfList: function(key, object) {
        var length = -1;
        if (Array.isArray(object[key])) {
            length = object[key].length;
        } else if ((object[key] instanceof GlideRecord) && !object[key].isValidRecord()) {
            length = object[key].getRowCount();
        }
        return length;
    },

    _convertGlideRecordOutputsToArray: function(flowOutputs) {
        var updatedFlowOutputs = {};
        for (var flowOutputVariable in flowOutputs) {
            var flowOutputValue = flowOutputs[flowOutputVariable];
            if ((flowOutputValue instanceof GlideRecord) && flowOutputValue.hasNext()) {
                var list = [];
                while (flowOutputValue.next()) {
                    var gr = new GlideRecord(flowOutputValue.getTableName());
                    gr.get(flowOutputValue.sys_id);
                    list.push(gr);
                }
                flowOutputValue = list;
            }
            updatedFlowOutputs[flowOutputVariable] = flowOutputValue;
        }
        return updatedFlowOutputs;
    },

    _consolidateFlowOutputObject: function(outputObj) {
        var outputObjArray = [];
        var arrayTypeAttribute = this._getArrayAttribute(outputObj);
        var length = 1;
        if (arrayTypeAttribute) {
            length = outputObj[arrayTypeAttribute].length;
        }
        for (var i = 0; i < length; i++) {
            var actionObject = {};
            var accessibleCheck = true;
            for (var key in outputObj) {
                if (outputObj[key] && Array.isArray(outputObj[key])) {
                    actionObject[key] = outputObj[key][i];
                } else {
                    actionObject[key] = outputObj[key];
                }
                //adding accessible check for reference type records
                if (sn_nb_action.NextBestActionUtil.isValidRecord(actionObject[key])) {
                    if (!actionObject[key].canRead()) {
                        accessibleCheck = false;
                        break;
                    }
                }
            }
            if (accessibleCheck)
                outputObjArray.push(actionObject);
        }
        return outputObjArray;
    },

    type: 'FlowGeneratorTypeHandler'
});
